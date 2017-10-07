# Mole fetch
Is Library for make background http request using ServiceWorker and Fetch API

Mole fetch is help web application make any HTTP request still running incase users are close a browser accidentally or network is disconnect. Mole fetch is using ServiceWokrer and SyncManager

##Installation

```
npm install --save mole-fetch
```
```
git clone https://github.com/thangman22/mole-fetch.git
```

##Usage

###HTML file
```javascript
const moleFetch = new MoleFetch()

function fetchFacebook() {
    //Call sendRequest for request HTTP
    moleFetch.sendRequest('facebook', 'http://localhost:5555/mock-api/online', false, 'GET')
}

//Register ServiceWoker
if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register("sw.js").then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }).catch(function(err) {
        console.log('ServiceWorker registration failed: ', err)
    })
}

//Implement onResponse for recieve response from ServiceWorker when site is online
moleFetch.onResponse('facebook').then((value) => {
    document.getElementById("result").innerHTML = value;
})

//Implement onResponse for recieve response from Cache when site is offline
moleFetch.getCacheResponse('facebook',false).then((value) => {
    document.getElementById("result").innerHTML = value;
})
```

### ServiceWorker file
```javascript
importScripts('node_modules/localforage/dist/localforage.min.js')
importScripts('node_modules/mole-fetch/dist/mole-fetch.js')

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('sync', (event) => {
  let moleFetch = new MoleFetch
  moleFetch.initBackgroudfetch(event)
})

```
## Method

#### sendRequest (taskName, url, data, method)

This method will be send request to ServiceWorker and request via FetchAPI

#### moleFetch.onResponse(taskName)

This method will wating result from FetchAPI matched by name return as Promise

#### moleFetch.getCacheResponse(taskName)

This method will get result from Cache that created when browser offline and matched by name as Promise

#### moleFetch.getTaskStatus(taskName)

This method will get return status by taskName

## Compatibility
Google Chrome 49+

## Support

If you’ve found an error in this library, please file an issue at: https://github.com/thangman22/mole-fetch/issues.

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub.


## License

Copyright 2016 Warat Wongmaneekit.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

