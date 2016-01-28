'use strict'

var BaseHandler = require('../utils/base-handler.js')
var Docks = require('../external/docks.js')

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
    return true
  }

  /**
   * method called to handle event
   * @param  {Event} event datadog event
   * @return {Promise}
   */
  static handle (event) {
    let instanceId = event.getInstanceId()

    return Unhealthy.getInstanceIpFromId(instanceId)
      .then(instanceIp => {
        return Docks.markUnhealthy(instanceIp)
          .then(() => Docks.killInstance(instanceIp))
      })
  }
}
