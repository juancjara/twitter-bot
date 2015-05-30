var crawler = require('./crawler');
var models = require('../models');

function bulkInsert(cinemas) {
  cinemas.forEach(function(cinema) {
    models.theater.create({
      name: cinema.name,
      id: 0
    })
  })
}

function start() {
  var data = crawler.extract(function(err, data) {
    if (err) console.log('err', err);
    bulkInsert(data);
  });
}

start();