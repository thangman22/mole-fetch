'use strict'

require('chai').should()
const API = require('mini-mock-api')
const path = require('path')
const seleniumAssistant = require('selenium-assistant')
const mochaUtils = require('sw-testing-helpers').mochaUtils
const myApi = new API({
  basePath: '/mock-api/',
  port: 5555,
  cors: true
})
describe('Test Mole Fetch', function () {
  this.timeout(100000)

  let globalDriverReference = null
  let testServerURL

  before(function () {
    myApi.get('online', (request, response) => {
      response.json({ status: 'okay',api: 'online'})
    })

    myApi.start()
  })

  after(function () {
    myApi.stop()
  })

  afterEach(function () {
    this.timeout(10000)
    return seleniumAssistant.killWebDriver(globalDriverReference)
  })

  const queueUnitTest = browserInfo => {
    it(`should pass all tests in ${browserInfo.getPrettyName()}`, () => {
      return browserInfo.getSeleniumDriver()
        .then(driver => {
          globalDriverReference = driver

          return mochaUtils.startWebDriverMochaTests(
            browserInfo.getPrettyName(),
            globalDriverReference,
            `http://localhost:9999/test/browser-tests`
          )
        })
        .then(testResults => {
          if (testResults.failed.length > 0) {
            const errorMessage = mochaUtils.prettyPrintErrors(
              browserInfo.prettyName,
              testResults
            )

            throw new Error(errorMessage)
          }
        })
    })
  }

  seleniumAssistant.printAvailableBrowserInfo()

  const automatedBrowsers = seleniumAssistant.getAvailableBrowsers()

  automatedBrowsers.forEach(browserInfo => {

    if (browserInfo.getSeleniumBrowserId() === 'firefox' &&
      browserInfo.getVersionNumber() <= 50) {
      return
    }

    if (browserInfo.getSeleniumBrowserId() !== 'firefox' &&
      browserInfo.getSeleniumBrowserId() !== 'chrome') {
      return
    }

    queueUnitTest(browserInfo)
  })
})
