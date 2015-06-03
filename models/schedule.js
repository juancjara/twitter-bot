var utils = require('../helpers/utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Q = require('q');
var Movie = require('./movie');
var Theater = require('./theater');

var scheduleSchema = new Schema({
  theater : {type: ObjectId, ref: 'Theater'},
  movie : {type: ObjectId, ref: 'Movie'},
  times: String
})

scheduleSchema.statics.create = function(params) {
  var tasks = [
    Movie.findOne({realName: params.movie}),
    Theater.findOne({realName: params.theater}),
  ];
  return Q.promise(function(resolve, reject) {
    Q.spread(tasks, function(movie, theater) {
      new Schedule({
        movie: movie._id,
        theater: theater._id,
        times: params.schedule
      }).save(resolve);
    });
  })
}

var Schedule = module.exports = mongoose.model('Schedule', scheduleSchema);