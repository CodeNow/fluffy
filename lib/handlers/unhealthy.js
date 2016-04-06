'use strict'

var put = require('101/put')

var BaseHandler = require('../utils/base-handler.js')
var Docks = require('../external/docks.js')
var log = require('../utils/logger.js')()

/**
 * marks dock unhealthy
 */
module.exports = class Unhealthy extends BaseHandler {
  /**
   * check to see if this handler should run the job
   * currently this handles all jobs
   * @return {Boolean}      return true if we should run this handler
   */
  static shouldHandle () {
    log.info('Unhealthy.shouldHandle returning true')
    return true
  }

  /**
   * method called to handle event
   * @param  {Event} event datadog event
   * @return {Promise}
   */
  static handle (event) {
    let instanceId = event.getInstanceId()
    let logData = { instanceId: instanceId }
    log.info(logData, 'Unhealthy.handle')

    return Docks.getInstanceIpFromId(instanceId)
      .then(instanceIp => {
        log.info(put({ instanceIp: instanceIp }, logData), 'handle: instanceIp returned')
        return Docks.markUnhealthy(instanceIp)
      })
  }
}
