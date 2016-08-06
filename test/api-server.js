const API = require('mini-mock-api')
var myApi = new API({
  basePath: '/mock-api/',
  port: 5555,
  cors: true
})
myApi.get('online', (request, response) => {
  response.json({ status: 'okay',api: 'online'})
})

myApi.get('offline', (request, response) => {
  setTimeout(function () { response.json({status: 'okay',api: 'offline'}) }, 5000)
})

myApi.start()
