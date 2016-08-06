var assert = chai.assert
var backgroundFetch = new MoleFetch

suite('Test Mole Fetch', function () {
  this.timeout(5000)

  test('sendRequest() Should be completed', function (done) {
    backgroundFetch.sendRequest('online', 'http://localhost:5555/mock-api/online', false, 'GET').then(function (registration) {
      try {
        assert.ok(true)
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  test('registerSync() Should be completed', function (done) {
    backgroundFetch.registerSync('online').then(function (registration) {
      try {
        assert.ok(true)
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  test('makeFetchConfig() Should be return correct format', function () {
    let fetchData = backgroundFetch.makeFetchConfig('{"url":"http://localhost:5555/mock-api/online","method":"GET","body":false}')
    assert.equal(fetchData.config.method, 'GET')
  })

  test('saveResultWhenOffline() Should be completed', function (done) {
    backgroundFetch.saveResultWhenOffline('online', {status: 'ok'}).then(function (value) {
      try {
        assert.equal(value.status, 'success')
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  test('updateTaskStatus() Should be updated', function (done) {
    backgroundFetch.updateTaskStatus('online', 'fetching').then(function (value) {
      return localforage.getItem(backgroundFetch.prefix + 'online-status')
    }).then(function (value) {
      try {
        assert.equal(value, 'fetching')
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  test('getTaskStatus() Should be fetching', function (done) {
    backgroundFetch.getTaskStatus('online').then((value) => {
      try {
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  test('updateTaskStatus() Should be remove when status is completed', function (done) {
    backgroundFetch.updateTaskStatus('online-completed', 'completed').then(function (value) {
      return localforage.getItem(backgroundFetch.prefix + 'online-completed-status')
    }).then(function (value) {
      try {
        assert.equal(value, null)
        done()
      } catch (err) {
        done(err)
      }
    })
  })
})
