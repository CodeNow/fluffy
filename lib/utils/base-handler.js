'use strict'

/**
 * base handler class to extend from
 * should handle and handle should be implemented
 */
module.exports = class BaseHandler {
  /**
   * check to see if this handler should run the job
   * @param  {Object} event event data
   * @return {Boolean}      return true if we should run this handler
   */
  static shouldHandle (event) {
    throw new Error('not implemented')
  }

  /**
   * method called to handle event
   * @param  {Object} event event data
   * @return {Promise}      should return a promise
   */
  static handle (event) {
    throw new Error('not implemented')
  }
}

/* EXAMPLE response
Recovered
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
