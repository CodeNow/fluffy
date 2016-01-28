'use strict'

var app = require('express')()
var bodyParser = require('body-parser')
var ErrorCat = require('error-cat')
var put = require('101/put')

var log = require('./utils/logger.js')
var UnhealthyHandler = require('./handlers/unhealthy.js')
var Event = require('./utils/event.js')

var error = new ErrorCat()

app.use(bodyParser.json())

/**
 * endpoint which receives datadog alerts
 * @param  {Object}  req  express request
 * @param  {Object}  res  express response
 * @return {null}         no return
 */
app.post('/alert', function (req, res) {
  let logData = { event: req.body }
  log.info(logData, 'alert received')
  // respond OK then process in background
  res.send('OK')

  Promise.resolve()
    .then(() => {
      let event = new Event(req.body)
      event.validateInput()

      if (UnhealthyHandler.shouldHandle()) {
        return UnhealthyHandler.handle(event)
      }
    })
    .then(() => log.info(logData, 'alert handled'))
    .catch(err => {
      log.error(put({ err: err }, logData), 'alert handing failed')
      error.report(err)
    })
})

app.all('*', function (req, res) {
  log.error({ body: res.body, url: res.url }, 'invalid endpoint')
  res.send('invalid endpoint')
})

app.listen(process.env.PORT)
