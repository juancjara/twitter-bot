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

function start() {
  var url = 'http://www.imdb.com/showtimes/';
  var data = scraper.scrap(url, function(err, data) {
    if (err) return console.log('err', err);
    console.log('scraper done');
    saveAll(data);
  });
}