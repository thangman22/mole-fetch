import { MoleFetchServiceWorker } from './mole-fetch.min.js'

const moleFetch = new MoleFetchServiceWorker()
moleFetch.initBackgroudfetch()

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})