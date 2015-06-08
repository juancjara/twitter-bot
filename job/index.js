var mongoose = require('mongoose');
var Q = require('q');

var scraper = require('./scraper');
var models = require('../models');
var utils = require('../helpers/utils');
var config = require('../config');

mongoose.connect(config.mongoConnection);

function createTask(fn, obj) {
  return fn(obj);
}

function getMovies(theaters) {
  var dicMovies = {};

  theaters.forEach(function(theater, i) {
    theater.movies.forEach(function(movie) {
      if (!(movie.name in dicMovies)) {
        dicMovies[movie.name] = {name: movie.name};
      }
    })
  })

  return utils.dicToArray(dicMovies);
}

function getSchedules(theaters) {
  var times = [];

  theaters.forEach(function(theater) {
    theater.movies.forEach(function(movie) {
      times.push({
        movie: movie.name,
        theater: theater.name,
        schedule: movie.schedule
      });
    });
  });

  return times;
}

function saveAll(theaters) {
  var theatersToSave = theaters
    .map(utils.partial(createTask, 
                       models.theater.findOrCreate));

  var moviesToSave = getMovies(theaters)
    .map(utils.partial(createTask, 
                       models.movie.findOrCreate));

  var toSave = theatersToSave.concat(moviesToSave);

  Q.all(toSave)
    .then(function(c) {
      console.log('cinemas and movies updated or save', c.length);

      var scheduleToSave = getSchedules(theaters)
        .map(utils.partial(createTask,
                           models.schedule.create));

      return Q.all(scheduleToSave);
    }).then(function(schedules) {
      console.log('schedules updated or save:', schedules.length);
    });
}



var zipCodes = [
  '',
  ''
];

//10001 10469 // my zip code rc 10013

function start() {
  var url = 'http://www.imdb.com/showtimes/US/10013';
  var data = scraper.scrap(url, function(err, data) {
    if (err) return console.log('err', err);
    console.log('scraper done');
    saveAll(data);
  });
}

start();

//http://www.geoplugin.net/extras/postalcode.gp?lat=40.720633899999996&long=-74.00082119999999