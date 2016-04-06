'use strict'

require('loadenv')()

var exec = require('child_process').exec
var ip = require('ip')
var put = require('101/put')

var log = require('../utils/logger.js')()

/**
 * environment to use for docks cli
 * NODE_ENV format is production-<env>
 * @type {String}
 */
var env = process.env.NODE_ENV.split('-')[1]

/**
 * base handler class to extend from
 * should handle and handle should be implemented
 */
module.exports = class Docks {
  /**
   * returns instance ip from instance id using docks aws command
   * @param  {String} instanceId instance id to get IP of
   * @return {Promise}
   * @resolves {String} ip address of instance
   */
  static getInstanceIpFromId (instanceId) {
    return new Promise((resolve, reject) => {
      let cmd = 'docks aws -e ' + env + " | awk '/" + instanceId + "/{print $6}'"
      let logData = {
        cmd: cmd,
        env: env,
        instanceId: instanceId
      }
      log.info(logData, 'Docks.getInstanceIp')

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          log.error(put({ err: err, stdout: stdout, stderr: stderr }), 'getInstanceIp: docks command failed')
          return reject(err)
        }

        log.trace(put({ stdout: stdout, stderr: stderr }, logData), 'getInstanceIp: docks command successful')

        stdout = stdout.replace(/\n/, '')
        if (!ip.isV4Format(stdout)) {
          log.error(logData, 'getInstanceIp: ip not found')
          return reject(new Error('ip not found'))
        }

        resolve(stdout)
      })
    })
  }

  /**
   * runs docks unhealthy command for passed ip
   * @param  {String} instanceIp ip address of dock to mark unhealthy
   * @return {Promise}
   */
  static markUnhealthy (instanceIp) {
    return new Promise((resolve, reject) => {
      let cmd = 'echo y | docks unhealthy -e ' + env + ' -i ' + instanceIp
      let logData = {
        cmd: cmd,
        env: env,
        instanceIp: instanceIp
      }
      log.info(logData, 'Dock.markUnhealthy')

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          log.error(put({ err: err, stdout: stdout, stderr: stderr }), 'markUnhealthy: docks command failed')
          return reject(err)
        }

        log.trace(put({ stdout: stdout, stderr: stderr }, logData), 'markUnhealthy: docks command successful')
        resolve()
      })
    })
  }

  /**
   * runs docks kill command for passed ip
   * @param  {String} instanceIp ip address of dock to mark unhealthy
   * @return {Promise}
   */
  static killInstance (instanceIp) {
    return new Promise((resolve, reject) => {
      let cmd = 'yes | docks kill -e ' + env + ' -i ' + instanceIp
      let logData = {
        cmd: cmd,
        env: env,
        instanceIp: instanceIp
      }
      log.info(logData, 'Dock.killInstance')

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          log.error(put({ err: err, stdout: stdout, stderr: stderr }), 'killInstance: docks command failed')
          return reject(err)
        }

        log.trace(put({ stdout: stdout, stderr: stderr }, logData), 'killInstance: docks command successful')
        resolve()
      })
    })
  }
}
