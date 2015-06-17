var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');
var Theater = require('./theater');

var utils = require('../helpers/utils');

var movieSchema = new Schema({
  realName: String,
  simpleName: String,
  created: { type: Date, default: Date.now }
});

movieSchema.statics.getList = function getList(cb) {
   Movie.find(cb);
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
      if (err) return reject(err);
      if (m) return resolve(m);
      new Movie(format(name)).save(function(err, movie) {
        if (err) return reject(err);
        var fields = {
          theaterId: params.theaterId,
          movieId: movie._id
        };
        resolve(movie);
      });
    });
  })
}

var Movie = module.exports = mongoose.model('Movie', movieSchema);