var mongoose = require('mongoose');
var Q = require('q');
var crawler = require('./crawler');
var models = require('../models');

mongoose.connect('mongodb://localhost/twitterbot');

function bulkInsert(cinemas) {
  /*var cinemasToInsert = cinemas.map(function(cinema, i) {
    return models.theater.format({
      name: cinema.name,
      id: i
    })
  });*/

  var dicCinema = {};
  var dicMovies = {};
  var tasks = [];
  //cinemas.forEach(function(cinema, i) {
    
    var cinema = cinemas[0];
    dicCinema[cinema.name] = {name: cinema.name};
    cinema.movies.forEach(function(movie) {
      if (!(movie.name in dicMovies)) {
        dicMovies[movie.name] = {name: movie.name};
        tasks.push(models.movie.create(movie.name));
      }
    })
  //})
  console.log('pasts')
  Q.all(tasks)
    .then(function(results) {
      console.log('ok', results);
      results.forEach(function(res) {
        console.log(res._id);
      });
    }, function(err) {
      console.log('error', err);
    })

  console.log('here');
}

function start() {
  var data = crawler.extract(function(err, data) {
    if (err) console.log('err', err);
    //console.log('data', data);
    bulkInsert(data);
  });
}

start();