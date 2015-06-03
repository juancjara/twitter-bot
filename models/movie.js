var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

var utils = require('../helpers/utils');

var movieSchema = new Schema({
  realName: String,
  simpleName: String,
  created: { type: Date, default: Date.now }
});

movieSchema.statics.getList = function getList(cb) {
var movies = [
  {
    _id: 'm1',
    realName: 'Tomorrowland',
    simpleName: 'tomorrowland',
    type: 'movie'
  },
  {
    _id: 'm2',
    realName: 'Pitch Perfect 2',
    simpleName: 'pitch perfect 2',
    type: 'movie'
  },
  {
    _id: 'm3',
    realName: 'Mad Max: Fury Road',
    simpleName: 'mad max fury road',
    type: 'movie'
  }
];
cb(null, movies);
};

function format(name) {
  name = name || '';
  return {
    realName: name,
    simpleName: utils.cleanText(name)
  }
};

movieSchema.statics.findOrCreate = function(params) {
  var name = params.name;
  return Q.promise(function(resolve, reject) {
    Movie.findOne({realName: name}, function(err, m) {
      if (err) reject(err);
      if (m) return resolve(m);
      new Movie(format(name)).save(resolve);
    });
  })
}


var Movie = module.exports = mongoose.model('Movie', movieSchema);