var CronJob = require('cron').CronJob;

var updateDatabase = require('./dailyUpdateDatabase');
//var time = '0 */1 * * * *';
var time = '0 */2 * * *';//2 hours
//var time = '00 30 3 * * *';

var doOnTick = function() {
	console.log('updateDatabase');
	updateDatabase.start();
};

var job = new CronJob({
  cronTime: time,
  onTick: doOnTick
})

doOnTick();

job.start();