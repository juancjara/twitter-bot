var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');
var Theater = require('./theater');

var utils = require('../helpers/utils');

var movieSchema = new Schema({
  realName: String,
  simpleName: String,
  updated: { type: Date, default: Date.now }
});

movieSchema.statics.getList = function getList(cb) {
   Movie.find(cb);
};

function format(name) {
  name = name || '';
  return {
    realName: name,
    simpleName: utils.cleanText(name),
    updated: Date.now()
  }
};

movieSchema.statics.clean = function(condition) {
  return Movie.remove(condition);
}

movieSchema.statics.findOrCreate = function(params) {
  var condition = {realName: params.name};
  var newData = format(params.name);

  return Q.promise(function(resolve, reject) {
    Movie.findOneAndUpdate(condition, newData, {new: true, upsert: true},
      function(err, data) {
        if (err) return reject(err);
        resolve(data);
      })
  });
}

var Movie = module.exports = mongoose.model('Movie', movieSchema);
