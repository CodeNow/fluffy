'use strict'

var put = require('101/put')

var log = require('./logger.js')()

/**
 * class which wraps datadog event to parse/validate data
 */
module.exports = class Event {
  /**
   * setup class with event data
   * @param  {Object} event event data from datadog
   */
  constructor (event) {
    var requiredKeys = ['event_tags', 'alert_transition', 'secret', 'event_type']
    log.info({ event: event, requiredKeys: requiredKeys }, 'Event.constructor')

    requiredKeys.forEach(function (key) {
      if (!event[key]) {
        throw new Error('event is missing key: ' + key)
      }
    })

    this.event_tags = event.event_tags
    this.alert_transition = event.alert_transition
    this.secret = event.secret
    this.event_type = event.event_type
  }

 /**
  * validate event from datadog to ensure correct event
  * @param  {Object} event event from datadog
  * @throws {Error}  If data invalid
  */
  validateInput () {
    log.info({ event: this }, 'Event.validateInput')

    if (this.secret !== 'I_solemnly_swear_that_I_am_up_to_no_good') {
      throw new Error('secret is wrong: ' + this.secret)
    }

    if (this.event_type !== 'metric_alert_monitor') {
      throw new Error('wrong event_type: ' + this.event_type)
    }

    if (this.alert_transition !== 'Triggered') {
      throw new Error('wrong alert_transition: ' + this.alert_transition)
    }
  }

  /**
   * parse instanceId out of event
   * @throws {Error} If instance id can not be found
   * @return {String} instance id
   */
  getInstanceId () {
    var logData = { event: this }
    log.info(logData, 'Event.getInstanceId')
    let tagsArray = this.event_tags.split(',')
    let instanceId = tagsArray.find(i => { return ~i.indexOf('host') }).split(':')[1]
    if (!instanceId) {
      log.error(logData, 'getInstanceId: instanceId not found')
      throw new Error('instanceId not found')
    }

    log.trace(put({ instanceId: instanceId }, logData), 'getInstanceId: instanceId found')
    return instanceId
  }
}
