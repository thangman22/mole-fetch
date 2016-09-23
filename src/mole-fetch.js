'use strict'

class MoleFetch {

  constructor () {
    this.prefix = 'bgfetch-'
    this.debug = true
  }

  // For Client
  onResponse (taskName) {
    return new Promise((resolve, reject) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        let messageData = JSON.parse(event.data)

        if (messageData.taskName === taskName) {
          resolve(messageData.result)
        }
      })
    })
  }

  sendRequest (taskName, url, data, method) {
    return navigator.serviceWorker.ready.then((registration) => {
      this.logDebug('ServiceWorker is Ready')
      let requestData
      requestData = data
      requestData.url = url
      if(method){
        requestData.method = method
      }
      this.logDebug('Save request to LocalForage [' + this.prefix + taskName + ']')

      localforage.setItem(this.prefix + taskName, JSON.stringify(requestData)).then(() => {
        this.logDebug('Register sync [' + this.prefix + taskName + ']')
        this.registerSync(taskName)
      })
    })
  }

  registerSync (taskName) {
    return navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register(this.prefix + taskName).then(() => {
        this.updateTaskStatus(taskName, 'requested')
      })
    })
  }

  getCacheResponse (taskName, expireTime) {
    return new Promise((resolve, reject) => {

      if (!localforage) {
        reject('localForage is required.')
      }

      let keyName = this.prefix + taskName + '-result'
      localforage.getItem(keyName).then((value) => {
        if (value) {
          localforage.removeItem(keyName)
          this.updateTaskStatus(taskName, 'completed')
          if (value.time <= expireTime || !expireTime) {
            this.logDebug('Found cache for [' + taskName + ']')
            resolve(value.result)
          } else {
            this.logDebug('Found cache but Expired [' + taskName + ']')
            resolve(false)
          }
        } else {
          this.logDebug('Not found cache [' + taskName + ']')
          resolve(false)
        }
      })
    })
  }

  initBackgroudfetch (event) {
    if (event.tag.indexOf(this.prefix) !== -1) {
      this.logDebug('Found bgfetch request [' + event.tag + ']')
      localforage.getItem(event.tag).then((value) => {

        let fetchData = this.makeFetchConfig(value)
        this.logDebug('Begin fetch request [' + event.tag + ']')

        let taskName = event.tag.replace(this.prefix, '')
        this.updateTaskStatus(taskName, 'fetching')
        this.makeFetch(fetchData, event.tag, taskName)
      })
    }
  }

  makeFetch (fetchData, tag, taskName) {
    return fetch(fetchData.url, fetchData.config).then((response) => {
      return response.text()
    }).then((response) => {
      this.logDebug('Fetch is Completed [' + tag + ']')
      localforage.removeItem(tag)
      let reponseWithoutBr = response.replace(/(\r\n|\n|\r)/gm, '')
      this.logDebug('Publish data to client [' + tag + ']')

      this.publishResult(taskName, reponseWithoutBr)
    })
  }

  makeFetchConfig (value) {
    let fetchData = JSON.parse(value);
    if (fetchData) {

      let url = fetchData.url

      if(!fetchData.mode){
        fetchData.mode = 'cors'
      }

      if(!fetchData.cache){
        fetchData.cache = 'default'
      }

      delete(fetchData.url)

      return {
        url: url,
        config: fetchData
      }
    }
  }

  publishResult (taskName, result, forceOffline) {
    this.logDebug('List client [' + this.prefix + taskName + ']')
    self.clients.matchAll({
      includeUncontrolled: true
    }).then((clientList) => {
      if (clientList.length == 0 || forceOffline === true) {
        this.updateTaskStatus(taskName, 'cached')
        this.saveResultWhenOffline(taskName, result)
      } else {
        this.updateTaskStatus(taskName, 'completed')
        for (let client of clientList) {
          this.postResult(taskName, result, client)
        }
      }
    })
  }

  saveResultWhenOffline (taskName, result) {
    return new Promise((resolve, reject) => {
      this.logDebug('client is offline save to LocalForage [' + this.prefix + taskName + ']')
      localforage.setItem(this.prefix + taskName + '-result', {
        'result': result,
        'time': new Date().getTime() / 1000
      }).then(() => {
        resolve({
          status: 'success'
        })
      })
    })
  }

  postResult (taskName, result, client) {
    this.logDebug('Push to client ' + client.id + ' [' + this.prefix + taskName + ']')
    let responseMessage = {
      'result': result,
      'taskName': taskName
    }
    client.postMessage(JSON.stringify(responseMessage))
  }

  updateTaskStatus (taskName, status) {
    return new Promise((resolve, reject) => {
      if (status !== 'completed') {
        localforage.setItem(this.prefix + taskName + '-status', status)
        resolve({
          status: 'success'
        })
      } else {
        localforage.removeItem(this.prefix + taskName + '-status')
        resolve({
          status: 'success'
        })
      }
    })
  }

  getTaskStatus (taskName) {
    return new Promise((resolve, reject) => {
      localforage.getItem(this.prefix + taskName + '-status').then((value) => {
        resolve(value)
      })
    })
  }

  logDebug (text) {
    if (this.debug === true) {
      console.log(text)
    }
  }

}
