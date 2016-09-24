importScripts('node_modules/localforage/dist/localforage.min.js')
importScripts('../src/mole-fetch.js')

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
