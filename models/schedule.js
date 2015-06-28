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
  updated: {type: Date, default: Date.now},
  times: String
})

scheduleSchema.statics.create = function(params) {
  var tasks = [
    Movie.findOne({realName: params.movie}),
    Theater.findOne({realName: params.theater}),
  ];

  return Q.promise(function(resolve, reject) {
    Q.spread(tasks, function(movie, theater) {
      var fields = {
        theaterId: theater._id,
        movieId: movie._id
      };

      Theater.addMovie(fields, function(err, m) {
        if (err) return reject(err);

        Schedule.findOneAndUpdate(fields, 
          {
            theaterId: theater._id,
            movieId: movie._id  ,
            times: params.schedule,
            updated: Date.now()
          },
          {new: true, upsert: true},
          function(err, m) {
            if (err) return reject(err);
            resolve(m);
          }
        )
      })
    })
  });
}

scheduleSchema.statics.getOne = function(params) {
  console.log(params);
  var tasks = [
    Movie.findById(params.movie),
    Theater.findById(params.theater),
  ];
  var response = {
    schedule: null,
    movie: null,
    theater: null
  }

  return Q.promise(function(resolve, reject) {
    Q.spread(tasks, function(movie, theater) {
      console.log('schedule getOne',movie.realName, theater.realName);
      Schedule.findOne({
        theaterId: params.theater,
        movieId: params.movie
      },function(err, m) {

        if (err) return reject(err);
        var response = {
          schedule: m ? m.times : '',
          movie: movie.realName,
          theater: theater.realName
        }
        return resolve(response);
      })
    })
  })
}

scheduleSchema.statics.clean = function(condition) {
  
  return Q.promise(function (resolve, reject) {
    Schedule.find(condition, function(err, times) {
      if (err) return reject(err);
      
      var cinemaMovieToRemove = times.map(function(time) {
        return {
          movie: time.toObject().movieId,
          theater: time.toObject().theaterId
        }
      });

      Theater.removeMovies(cinemaMovieToRemove)
        .then(function(err) {
          if (err) return reject(err);
          Schedule.remove(condition, resolve);
        });
    });

  })
}
 
scheduleSchema.statics.clear = function () {
  return Q.promise(function (resolve, reject) {    
    Schedule.remove({}, function(err){
      if(err) rejected(err);
      console.log('cleaned');
      resolve();
    });
  });
}

var Schedule = module.exports = mongoose.model('Schedule', scheduleSchema);