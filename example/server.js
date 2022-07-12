const express = require('express')
const path = require('path')
const app = express()
const port = 3333
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/offline', (req, res) => {
  res.json({ status: 'success', api: 'offline' })
})

app.get('/online', (req, res) => {
  setTimeout(function () {
    console.log('Status: success')
    res.json({ status: 'success', api: 'online' })
  }, 10000)
})

app.listen(port, () => {
  console.log(`Mole fetch example listening on port ${port}`)
})
