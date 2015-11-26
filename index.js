'use strict'

var app = require('express')()
var bodyParser = require('body-parser')
var ErrorCat = require('error-cat')
var error = new ErrorCat()
var exec = require('child_process').exec
var ip = require('ip')

var env = process.env.NODE_ENV === 'production' ? 'production' : 'beta'

app.use(bodyParser.json())

app.post('/alert', function (req, res) {
  console.log('woof, alert found, will try to help', req.body)
  res.send('OK')
  Promise.resolve()
    .then(() => validateInput(req.body, ['event_tags', 'alert_transition', 'secret', 'title', 'link', 'event_type']))
    .then(() => getInstanceId(req.body))
    .then(instanceId => runRecovery(instanceId))
    .catch(err => console.error('I have failed you master', err))
    .catch(err => error.report(err))
    .then(() => console.log('I am done'))
})

app.all('*', function (req, res) {
  console.log('nothing here')
  res.send('nothing here')
})

app.listen(process.env.PORT)

function validateInput (data, keys) {
  console.log('validate input', data)
  keys.forEach(function (key) {
    if (!data[key]) {
      throw new Error('data is missing key: ' + key)
    }
  })
  if (data.secret !== 'I_solemnly_swear_that_I_am_up_to_no_good') {
    throw new Error('secret is wrong: ' + data.secret)
  }
  if (data.event_type !== 'metric_alert_monitor') {
    throw new Error('wrong event_type: ' + data.event_type)
  }
  if (data.alert_transition !== 'Triggered') {
    throw new Error('wrong alert_transition: ' + data.alert_transition)
  }
}

function getInstanceId (data) {
  console.log('finding instanceId')
  let tagsArray = data.event_tags.split(',')
  let instanceId = tagsArray.find(i => { return ~i.indexOf('host') }).split(':')[1]
  if (!instanceId) {
    throw new Error('instanceId not found')
  }

  return instanceId
}
function runRecovery (instanceId) {
  return getInstanceIp(instanceId)
    .then(instanceIp => markUnhealthy(instanceIp))
    .then(() => killInstance(instanceId))
}

function killInstance (instanceId) {
  return new Promise((resolve, reject) => {
    let cmd = 'echo y | docks kill -e ' + env + ' -i ' + instanceId
    console.log('killInstance id:', instanceId, 'trying', cmd)

    exec(cmd, (err, stdout, stderr) => {
      console.log('--output (err):', err, 'stdout:', stdout, 'stderr', stderr)
      if (err) { return reject(new Error(err + ':' + err.stderr)) }

      resolve()
    })
  })
}

function getInstanceIp (instanceId) {
  return new Promise((resolve, reject) => {
    let cmd = 'docks aws -e ' + env + " | awk '/" + instanceId + "/{print $6}'"
    console.log('getInstanceIp from id:', instanceId, 'trying', cmd)

    exec(cmd, (err, stdout, stderr) => {
      console.log('--output (err):', err, 'stdout:', stdout, 'stderr', stderr)
      if (err) { return reject(new Error(err + ':' + err.stderr)) }

      stdout = stdout.replace(/\n/, '')
      if (!ip.isV4Format(stdout)) { return reject(new Error('ip not found')) }

      resolve(stdout)
    })
  })
}

function markUnhealthy (instanceIp) {
  return new Promise((resolve, reject) => {
    let cmd = 'echo y | docks unhealthy -e ' + env + ' -i ' + instanceIp
    console.log('markUnhealthy with ip:', instanceIp, 'trying', cmd)

    exec(cmd, (err, stdout, stderr) => {
      console.log('--output (err):', err, 'stdout:', stdout, 'stderr', stderr)
      if (err) { return reject(new Error(err + ':' + err.stderr)) }

      resolve(stdout)
    })
  })
}

/* EXAMPLE response
Recoverd
{
  "alert_transition": "Recovered",
  "body": "%%%\nrestart docker\nhttps://github.com/CodeNow/devops-scripts/wiki/Restarting-Docker\n\nor add new dock @slack-ops @pagerduty @webhook-test2 @webhook-fluffy\n\n\n\n  **Dock is almost out of memory...** was marked as **recovered** on **host:i-3b93aafb,region:us-west-1,role:dock** by Anand Patel.\n\n**Dock is almost out of memory...** was last triggered **3 mins ago**.\n\n- - -\n\n[[Monitor Status](https://app.datadoghq.com/monitors#309811?group=host%3Ai-3b93aafb)] · [[Edit Monitor](https://app.datadoghq.com/monitors#309811/edit)] · [[View i-3b93aafb](https://app.datadoghq.com/infrastructure?hostname=i-3b93aafb)]\n%%%",
  "date": "1448435477000",
  "event_id": "3089903685627551077",
  "event_tags": "availability-zone:us-west-1a,host:i-3b93aafb,image:ami-9f305fff,instance-type:c3.large,kernel:none,monitor,org:6585,region:us-west-1,role:dock,security-group:sg-59a3503c,security-group:sg-cb8e7dae",
  "event_type": "metric_alert_monitor",
  "link": "https://app.datadoghq.com/event/event?id=3089903685627551077",
  "secret": "I_solemnly_swear_that_I_am_up_to_no_good",
  "title": "[Recovered on {host:i-3b93aafb}] Dock is almost out of memory..."
}
Triggered
{
  "alert_transition": "Triggered",
  "body": "%%%\nrestart docker\nhttps://github.com/CodeNow/devops-scripts/wiki/Restarting-Docker\n\nor add new dock @slack-ops @pagerduty @webhook-test2 @webhook-fluffy\n\n\n\n[![Metric Graph](https://p.datadoghq.com/snapshot/view/dd-snapshots-prod/org_9822/2015-11-25/f19af4d9981c8baa5a0692d565014b4808a07a80.png)](https://app.datadoghq.com/monitors#309811?to_ts=1448435520000&group=host%3Ai-3b93aafb&from_ts=1448431920000)\n\n  **system.mem.usable** over **region:us-west-1, role:dock** was **<= 500000000.0** on average during the **last 30m**.\n\n**Dock is almost out of memory...** was last triggered **10 secs ago**.\n\n- - -\n\n[[Monitor Status](https://app.datadoghq.com/monitors#309811?group=host%3Ai-3b93aafb)] · [[Edit Monitor](https://app.datadoghq.com/monitors#309811/edit)] · [[View i-3b93aafb](https://app.datadoghq.com/infrastructure?hostname=i-3b93aafb)]\n%%%",
  "date": "1448435530000",
  "event_id": "3089904566766935419",
  "event_tags": "availability-zone:us-west-1a,host:i-3b93aafb,image:ami-9f305fff,instance-type:c3.large,kernel:none,monitor,org:6585,region:us-west-1,role:dock,security-group:sg-59a3503c,security-group:sg-cb8e7dae",
  "event_type": "metric_alert_monitor",
  "link": "https://app.datadoghq.com/event/event?id=3089904566766935419",
  "secret": "I_solemnly_swear_that_I_am_up_to_no_good",
  "title": "[Triggered on {host:i-3b93aafb}] Dock is almost out of memory..."
}
*/
