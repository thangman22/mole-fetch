<img src="banner.svg" alt="logo" align="center"/>

<div align="center">
<h2>Mole Fetch, Keep your task running in background.</h2>
<p>A lightweight library, assists in making background HTTP requests by using Service Workers and Fetch API.<p>

<a href="https://badge.fury.io/js/mole-fetch">
    <img src="https://badge.fury.io/js/mole-fetch.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/mole-fetch">
    <img src="https://img.shields.io/npm/dm/mole-fetch.svg" alt="Downloads" />
  </a>
  <a href="https://packagequality.com/#?package=mole-fetch">
    <img src="https://npm.packagequality.com/shield/mole-fetch.svg" alt="Package Quality" />
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-green.svg" alt="Package Quality" />
  </a>
</div>


# About

Mole Fetch allows HTTP requests to run in the background, even if the users have accidentally closed a browser, or the network has disconnected. This library uses Service Workers and Synchronization Managers.


## Installation

```
npm install --save mole-fetch
```
or
```
git clone https://github.com/thangman22/mole-fetch.git
```


## Usage Example

### HTML file
```javascript
const moleFetch = new MoleFetch()

function fetchFacebook() {
    // Call sendRequest for request HTTP
    moleFetch.sendRequest('facebook', 'http://localhost:5555/mock-api/online', false, 'GET',{
      start: {
        title: 'Loading....'
      },
      finished: {
        title: 'Loading is finished'
      }
    })
}

// Register Service Wokers
if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register("sw.js").then((registration) => {
        console.log('Service Workers registration successful with scope: ', registration.scope)
    }).catch(function(err) {
        console.error('Service Workers registration failed: ', err)
    })
}

// Implement onResponse for recieve response from ServiceWorker when site is online
moleFetch.onResponse('facebook').then((value) => {
    document.getElementById("result").innerHTML = value;
})

// Implement onResponse for recieve response from Cache when site is offline
moleFetch.getCacheResponse('facebook', false).then((value) => {
    document.getElementById("result").innerHTML = value;
})
```


### Service Workers file
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


## Method API

#### sendRequest (taskName, url, data, method)

This method will be send request to ServiceWorker and request via FetchAPI

#### moleFetch.onResponse(taskName)

This method will wating result from FetchAPI matched by name return as Promise

#### moleFetch.getCacheResponse(taskName)

This method will get result from Cache that created when browser offline and matched by name as Promise

#### moleFetch.getTaskStatus(taskName)

This method will get return status by taskName


## Browser Supported

| [<img src="https://cdn.rawgit.com/alrra/browser-logos/f50d4cc8/src/edge/edge.png" alt="IE / Edge" width="64px" height="64px" />](http://caniuse.com/#feat=fetch)</br>Edge | [<img src="https://cdn.rawgit.com/alrra/browser-logos/f50d4cc8/src/firefox/firefox.png" alt="Firefox" width="64px" height="64px" />](http://caniuse.com/#feat=fetch)</br>Firefox | [<img src="https://cdn.rawgit.com/alrra/browser-logos/f50d4cc8/src/chrome/chrome.png" alt="Chrome" width="64px" height="64px" />](http://caniuse.com/#feat=fetch)</br>Chrome | [<img src="https://cdn.rawgit.com/alrra/browser-logos/f50d4cc8/src/safari/safari.png" alt="Safari" width="64px" height="64px" />](http://caniuse.com/#feat=fetch)</br>Safari | [<img src="https://cdn.rawgit.com/alrra/browser-logos/f50d4cc8/src/opera/opera.png" alt="Opera" width="64px" height="64px" />](http://caniuse.com/#feat=fetch)</br>Opera | 
| ---------: | ---------: | ---------: | ---------: | ---------:
| 17+ | 44+ | 45+ | 11.1+ | 32+


## Contribution

If you’ve found an error in this library, please file an issue at: https://github.com/thangman22/mole-fetch/issues

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub.


### License

Copyright 2016-2018 Warat Wongmaneekit.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
