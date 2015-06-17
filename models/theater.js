var utils = require('../helpers/utils');
var mongoose = require('mongoose');
var Movie = require('./movie');
var Schema = mongoose.Schema;

var theaterSchema = new Schema({
  realName: String,
  simpleName: String,
  movies: [{type: Schema.Types.ObjectId, ref: 'Movie'}],
  created: { type: Date, default: Date.now }
});

theaterSchema.statics.getList = function getList(cb) {
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
  var cinema = {
    realName: name,
    simpleName: utils.cleanText(name)
  }
  return cinema;
}

theaterSchema.statics.findOrCreate = function(params) {
  var name = params.name;
  return Theater.findOne({realName: name}, function(err, m) {
    if (m) return m;
    return new Theater(format(name)).save();
  });
}

var Theater = module.exports = mongoose.model('Theater', theaterSchema);
