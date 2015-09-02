var Q = require('q');
var mongoose = require('mongoose');

var utils = require('../helpers/utils');
var Movie = require('./movie');
var Schema = mongoose.Schema;

var theaterSchema = new Schema({
  realName: String,
  simpleName: String,
  movies: [{type: Schema.Types.ObjectId, ref: 'Movie'}],
  updated: { type: Date, default: Date.now }
});

theaterSchema.statics.getList = function (cb) {
  Theater.find(cb);
};

theaterSchema.statics.addMovie = function(params, cb) {
  Theater.findById(params.theaterId, function(err, m) {
    if (err) return cb(err);
    var idx = m.movies.indexOf(params.movieId);
    if (idx > -1) return cb(null);
    m.movies.push(params.movieId)
    m.save(cb);
  });
}

pullMovie = function(params) {
  return Theater.findByIdAndUpdate(params.theaterId, 
                                   {$pullAll: {movies : params.movies}})
}

theaterSchema.statics.removeMovies = function(data) {
  var dic = {};
  var elem;

  for (var i = data.length - 1; i >= 0; i--) {
    elem = data[i];
    if (!(elem.theater in dic)) {
      dic[elem.theater] = {movies: [], theaterId: elem.theater};
    }
    dic[elem.theater].movies.push(elem.movie);
  };

  var tasks = utils.dicToArray(dic).map(pullMovie);
  return Q.promise(function(resolve, reject) {
    Q.all(tasks).then(function(m) {
      console.log('done');
      resolve();
    })
  })
}

theaterSchema.statics.getMovies = function(id) {
  return Q.promise(function(resolve, reject) {
    Theater.findOne({_id: id}, {}).populate("movies")
      .exec(function(err, model) {
        if (err) return reject(err);
        resolve(model);
      });
  })
};

theaterSchema.statics.clean = function(condition) {
  return Theater.remove(condition);
}

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
