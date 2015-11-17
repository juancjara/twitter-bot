var moment = require('moment');
var schedule = require('../models/schedule');
var movie = require('../models/movie');
var theater = require('../models/theater');

module.exports.start = function(cb) {

  var minDate = moment().subtract(6, 'hours').toDate();
  var condition = {
    updated: {$lt: minDate}
  };

  schedule.clean(condition)
    .then(function() {
      console.log('schedule clean');
      return movie.clean(condition);
    })
    .then(function() {
      console.log('movie clean');
      return theater.clean(condition);
    })
    .then(function() {
      console.log('theater clean');
      if (cb) cb();
    });
};
