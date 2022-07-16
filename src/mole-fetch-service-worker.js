import localforage from 'localforage/src/localforage.js'
import { updateTaskStatus } from './mole-fetch-utils'

export class MoleFetchServiceWorker {
  constructor () {
    this.prefix = 'bgfetch-'
    this.debug = false
  }

  async initBackgroudfetch () {
    self.addEventListener('sync', async (event) => {
      if (event.tag.indexOf(this.prefix) !== -1) {
        this.logDebug('Found bgfetch request [' + event.tag + ']')
        const value = await localforage.getItem(event.tag)
        const fetchData = this.makeFetchConfig(value)
        this.logDebug('Begin fetch request [' + event.tag + ']')

        const taskName = event.tag.replace(this.prefix, '')
        updateTaskStatus(this.prefix, taskName, 'fetching')
        this.makeFetch(fetchData, event.tag, taskName)
      }
    })
  }

  async makeFetch (fetchData, tag, taskName) {
    const notificationData = await localforage.getItem(tag + '-notification')
    notificationData.start.tag = tag + '-notification'
    self.registration.showNotification(notificationData.start.title, notificationData.start.options)
    const request = new Request(fetchData.url, fetchData.config)
    const fetchObject = await fetch(request)
    const response = await fetchObject.json()
    this.logDebug('Fetch is Completed [' + tag + ']')
    localforage.removeItem(tag)
    this.logDebug('Publish data to client [' + tag + ']')
    notificationData.finished.tag = tag + '-notification'
    self.registration.showNotification(notificationData.finished.title, notificationData.finished.options)
    this.publishResult(taskName, response)
  }

  async publishResult (taskName, result) {
    this.logDebug('List client [' + this.prefix + taskName + ']')
    const clientList = await self.clients.matchAll({
      includeUncontrolled: true
    })
    this.saveResultWhenOffline(taskName, result)
    updateTaskStatus(this.prefix, taskName, 'completed')
    if (clientList.length > 0) {
      for (const client of clientList) {
        this.postResultToClient(taskName, result, client)
      }
    }
  }

  async saveResultWhenOffline (taskName, result) {
    this.logDebug('client is offline save to LocalForage [' + this.prefix + taskName + ']')
    await localforage.setItem(this.prefix + taskName + '-result', {
      fresh: true,
      result,
      time: Math.round(new Date().getTime() / 1000)
    })
    return {
      status: 'success'
    }
  }

  postResultToClient (taskName, result, client) {
    this.logDebug('Push to client ' + client.id + ' [' + this.prefix + taskName + ']')
    const responseMessage = {
      result,
      taskName
    }
    client.postMessage(responseMessage)
  }

  makeFetchConfig (fetchData) {
    if (fetchData) {
      const url = fetchData.url

      delete (fetchData.url)

      return {
        url,
        config: fetchData
      }
    }
  }

  logDebug (text) {
    if (this.debug === true) {
      console.log(text)
    }
  }
}
