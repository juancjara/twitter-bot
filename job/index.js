var CronJob = require('cron').CronJob;
var moment = require('moment');

var updateData = require('./updateData');
var cleanData = require('./cleanData');
//var time = '0 */1 * * * *';
var crawlerTime = '0 */1 * * *';
var cleanerTime = '0 */6 * * *';
//var time = '00 30 3 * * *';

var clean = function() {
  console.log('cleaning', moment().toDate());
  cleanData.start();
};

var update = function() {
	console.log('updateData', moment().toDate());
	updateData.start();
};

var cleaner = new CronJob({
  cronTime: cleanerTime,
  onTick: clean
})

var updater = new CronJob({
  cronTime: crawlerTime,
  onTick: update
})

clean();
update();

updater.start();
cleaner.start();

