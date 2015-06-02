var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var utils = require('../helpers/utils');

var movieSchema = new Schema({
  realName: String,
  simpleName: String
});

movieSchema.statics.getList = function getList(cb) {
  var movies = [
    {
      id: 'm1',
      realName: 'Tomorrowland',
      simpleName: 'tomorrowland',
      type: 'movie'
    },
    {
      id: 'm2',
      realName: 'Pitch Perfect 2',
      simpleName: 'pitchperfect2',
      type: 'movie'
    },
    {
      id: 'm3',
      realName: 'Mad Max: Fury Road',
      simpleName: 'madmaxfuryroad',
      type: 'movie'
    }
  ];
  cb(null, movies);
};

format = function format(name) {
  name = name || '';
  return {
    realName: name,
    simpleName: utils.cleanText(name)
  }
};

movieSchema.statics.create = function create(name) {
  var movie = new Movie(format(name));
  return movie.save();
};

var Movie = module.exports = mongoose.model('Movie', movieSchema);