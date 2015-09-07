var mongoose = require('mongoose');
var Q = require('q');

var peruScraper = require('./peru-scraper');
var usScraper = require('./scraper');
var models = require('../models');
var cinema = require('../models/theater');
var utils = require('../helpers/utils');
var config = require('../config');

mongoose.connect(config.mongoConnection, function(err) {
  console.log(err);
});

function createTask(fn, obj) {
  return fn(obj);
}

function getMovies(theaters) {
  var dicMovies = {};

  theaters.forEach(function(theater, i) {
    var idTheater = theater.movies
      .forEach(function(movie) {
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

function saveAll(theaters, cb) {
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

      models.schedule.clear().then(function(err) {
        var scheduleToSave = getSchedules(theaters)
          .map(utils.partial(createTask,
                             models.schedule.create));

        Q.all(scheduleToSave).then(function(schedules) {
          console.log('schedules updated or save:', schedules.length);
          cb();
        });;
      });

    })
}

var scrap = function(url, scraper, cb) {
  var data = scraper.scrap(url, function(err, data) {
    if (err) return console.log('err', err);
    console.log('scraper done');
    saveAll(data, cb);
  });
};

var handleJesusMariaData = function(moviesData) {
  var cinemaName = 'Cineplaza Jesus Maria';
  var toSave = [];
  toSave.concat(createTask(cinema.findOrCreate, {name: cinemaName}));
  toSave.concat(moviesData.map(utils.partial(createTask,
                                             models.movie.findOrCreate)));
  Q.all(toSave)
    .then(function(c) {
      console.log('jesusmaria updated');

      var scheduleToSave = moviesData
        .map(function(movie) {
          console.log(movie.name, cinemaName, movie.times);
          return {
            movie: movie.name,
            theater: cinemaName,
            schedule: movie.times
          }
        })
        .map(utils.partial(createTask, models.schedule.create));
      Q.all(scheduleToSave).then(function(schedules) {
        console.log('schedules jesus maria updated', schedules.length);
      })
      console.log(scheduleToSave);
    })
};

var start = function() {
  //scrap('http://www.imdb.com/showtimes/US/10013', usScraper);

  scrap('http://carteleraperu.com/', peruScraper,
        function() {
          peruScraper.scrapJesusMaria()
            .then(handleJesusMariaData);
        }
  );
};

module.exports.start = start;

//http://www.geoplugin.net/extras/postalcode.gp?lat=40.720633899999996&long=-74.00082119999999
