var Q = require('q');
var mongoose = require('mongoose');

var utils = require('../helpers/utils');
var Movie = require('./movie');
var Schema = mongoose.Schema;

var theaterSchema = new Schema({
  realName: String,
  simpleName: String,
  movies: [{type: Schema.Types.ObjectId, ref: 'Movie'}],
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

theaterSchema.statics.getList = function (cb) {
  Theater.find(cb);
}

theaterSchema.statics.addMovie = function(params, cb) {
  Theater.findByIdAndUpdate(params.theaterId, 
                            {$push: {movies: params.movieId}}, cb);
}

theaterSchema.statics.getMovies = function(id, cb) {
  Theater.findOne({_id: id}, {}).populate("movies").exec(cb);
};

function format(name) {
  return {
    realName: name,
    simpleName: utils.cleanText(name),
    updated: Date.now()
  }
}

theaterSchema.statics.findOrCreate = function(params) {
  var condition = {realName: params.name};
  var newData = format(params.name);
  
  return Q.promise(function(resolve, reject) {
    Theater.findOneAndUpdate(condition, newData, {new: true, upsert: true},
      function(err,data) {
        if (err) return reject(err);
        resolve(data);
      });
  })

}

/*theaterSchema.statics.findOrCreate = function(params) {
  var name = params.name;
  return Theater.findOne({realName: name}, function(err, m) {
    if (m) {
      m.updated = Date.now
    }
    return new Theater(format(name)).save();
  });
}*/


var Theater = module.exports = mongoose.model('Theater', theaterSchema);
