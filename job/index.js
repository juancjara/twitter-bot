var CronJob = require('cron').CronJob;
var moment = require('moment');

var updateData = require('./updateData');
var cleanData = require('./cleanData');
//var time = '0 */1 * * * *';
var twoHours = '0 */2 * * *';//2 hours
var sixHours = '0 */6 * * *'; // 6 hours
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
  cronTime: sixHours,
  onTick: clean
})

var updater = new CronJob({
  cronTime: twoHours,
  onTick: update
})

clean(function() {
  update();
})

updater.start();
cleaner.start();

