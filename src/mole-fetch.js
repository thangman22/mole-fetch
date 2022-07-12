import localforage from 'localforage/src/localforage.js'

export class MoleFetch {
  constructor () {
    this.prefix = 'bgfetch-'
    this.debug = false
  }

  // For Client
  onResponse (taskName) {
    return new Promise((resolve, reject) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const messageData = JSON.parse(event.data)

        if (messageData.taskName === taskName) {
          resolve(messageData.result)
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
        localforage.setItem(this.prefix + taskName + '-notification', JSON.stringify(notificationDetail))
      } else {
        throw new Error('Notification should be contain title,body properties')
      }
    }

    await localforage.setItem(this.prefix + taskName, JSON.stringify(requestOptions))
    this.logDebug('Register sync [' + this.prefix + taskName + ']')
    this.registerSync(taskName)
  }

  async registerSync (taskName) {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(this.prefix + taskName)
    this.updateTaskStatus(taskName, 'requested')
  }

  async getCacheResponse (taskName, expireTime) {
    if (!localforage) {
      return new Error('localForage is required.')
    }

    const keyName = this.prefix + taskName + '-result'
    const value = await localforage.getItem(keyName)
    if (value) {
      localforage.removeItem(keyName)
      this.updateTaskStatus(taskName, 'completed')
      if (value.time <= expireTime || !expireTime) {
        this.logDebug('Found cache for [' + taskName + ']')
        return value.result
      } else {
        this.logDebug('Found cache but Expired [' + taskName + ']')
        return false
      }
    } else {
      this.logDebug('Not found cache [' + taskName + ']')
      return false
    }
  }

  async initBackgroudfetch (event) {
    if (event.tag.indexOf(this.prefix) !== -1) {
      this.logDebug('Found bgfetch request [' + event.tag + ']')
      const value = await localforage.getItem(event.tag)
      const fetchData = this.makeFetchConfig(value)
      this.logDebug('Begin fetch request [' + event.tag + ']')

      const taskName = event.tag.replace(this.prefix, '')
      this.updateTaskStatus(taskName, 'fetching')
      this.makeFetch(fetchData, event.tag, taskName)
    }
  }

  async makeFetch (fetchData, tag, taskName) {
    const value = await localforage.getItem(tag + '-notification')
    const notificationData = JSON.parse(value)
    notificationData.start.tag = tag + '-notification'
    self.registration.showNotification(notificationData.start.title, notificationData.start)
    const request = new Request(fetchData.url, fetchData.config)
    const fetchObject = await fetch(request)
    const response = await fetchObject.text()
    this.logDebug('Fetch is Completed [' + tag + ']')
    localforage.removeItem(tag)
    const reponseWithoutBr = response.replace(/(\r\n|\n|\r)/gm, '')
    this.logDebug('Publish data to client [' + tag + ']')
    notificationData.finished.tag = tag + '-notification'
    self.registration.showNotification(notificationData.finished.title, notificationData.finished)

    this.publishResult(taskName, reponseWithoutBr)
  }

  makeFetchConfig (value) {
    const fetchData = JSON.parse(value)
    if (fetchData) {
      const url = fetchData.url

      delete (fetchData.url)

      return {
        url,
        config: fetchData
      }
    }
  }

  async publishResult (taskName, result, forceOffline) {
    this.logDebug('List client [' + this.prefix + taskName + ']')
    const clientList = await self.clients.matchAll({
      includeUncontrolled: true
    })
    if (clientList.length === 0 || forceOffline === true) {
      this.updateTaskStatus(taskName, 'cached')
      this.saveResultWhenOffline(taskName, result)
    } else {
      this.updateTaskStatus(taskName, 'completed')
      for (const client of clientList) {
        this.postResult(taskName, result, client)
      }
    }
  }

  async saveResultWhenOffline (taskName, result) {
    this.logDebug('client is offline save to LocalForage [' + this.prefix + taskName + ']')
    await localforage.setItem(this.prefix + taskName + '-result', {
      result,
      time: new Date().getTime() / 1000
    })
    return {
      status: 'success'
    }
  }

  postResult (taskName, result, client) {
    this.logDebug('Push to client ' + client.id + ' [' + this.prefix + taskName + ']')
    const responseMessage = {
      result,
      taskName
    }
    client.postMessage(JSON.stringify(responseMessage))
  }

  async updateTaskStatus (taskName, status) {
    if (status !== 'completed') {
      localforage.setItem(this.prefix + taskName + '-status', status)
      return {
        status: 'success'
      }
    } else {
      localforage.removeItem(this.prefix + taskName + '-status')
      return {
        status: 'success'
      }
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
