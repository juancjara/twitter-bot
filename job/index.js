var CronJob = require('cron').CronJob;

var dailyUpdateDatabase = require('./dailyUpdateDatabase');

var time = '00 30 3 * * *';
var job = new CronJob({
  cronTime: time,
  onTick: function() {
    console.log('dailyUpdateDatabase');
    dailyUpdateDatabase.start();
  }
})

job.start();