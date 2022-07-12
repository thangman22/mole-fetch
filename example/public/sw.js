import { MoleFetch } from './mole-fetch.min.js'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('sync', (event) => {
  const moleFetch = new MoleFetch()
  moleFetch.initBackgroudfetch(event)
})
