import localforage from 'localforage/src/localforage.js'
import { updateTaskStatus } from './mole-fetch-utils'
export class MoleFetchClient {
  constructor () {
    this.prefix = 'bgfetch-'
    this.debug = false
  }

  // For Client
  onResponse (taskName) {
    return new Promise((resolve, _reject) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const messageData = event.data
        if (messageData.taskName === taskName) {
          resolve({ status: 'live', result: messageData.result })
        }
      })
    })
  }

  async sendRequest (taskName, url, options, notificationDetail) {
    await Notification.requestPermission()
    await navigator.serviceWorker.ready
    this.logDebug('ServiceWorker is Ready')
    const requestOptions = options
    requestOptions.url = url

    this.logDebug('Save request to LocalForage [' + this.prefix + taskName + ']')
    if (notificationDetail && Notification.permission === 'granted') {
      if (notificationDetail.start && notificationDetail.finished) {
        localforage.setItem(this.prefix + taskName + '-notification', notificationDetail)
      } else {
        throw new Error('Notification should be contain title,body properties')
      }
    }

    await localforage.setItem(this.prefix + taskName, requestOptions)
    this.logDebug('Register sync [' + this.prefix + taskName + ']')
    this.registerSync(taskName)
    const response = await this.onResponse(taskName)
    return response
  }

  async registerSync (taskName) {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(this.prefix + taskName)
    updateTaskStatus(this.prefix, taskName, 'requested')
  }

  async getCacheResponse (taskName, expireTime) {
    if (!localforage) {
      return new Error('localForage is required.')
    }

    const keyName = this.prefix + taskName + '-result'
    const value = await localforage.getItem(keyName)
    if (value) {
      updateTaskStatus(this.prefix, taskName, 'completed')
      if (value.time <= expireTime || !expireTime) {
        this.logDebug('Found cache for [' + taskName + ']')
        await localforage.setItem(this.prefix + taskName + '-result', {
          fresh: false,
          result: value.result,
          time: value.time
        })
        return { status: 'offline', fresh: value.fresh, time: value.time, result: value.result }
      } else {
        this.logDebug('Found cache but Expired [' + taskName + ']')
        return false
      }
    } else {
      this.logDebug('Not found cache [' + taskName + ']')
      return false
    }
  }

  getTaskStatus (taskName) {
    return localforage.getItem(this.prefix + taskName + '-status')
  }

  logDebug (text) {
    if (this.debug === true) {
      console.log(text)
    }
  }
}
