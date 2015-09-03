var Q = require('q');
var models = require('../models');
var cinema = require('../models/theater');
var utils = require('./utils');

var sortDescByRank = function(a, b) {
  return b.rank - a.rank;
};

var lcs = function(str1, str2) {
  var longestCS = 0;

  var m = [];
  var len1 = str1.length;
  var len2 = str2.length;
  var row, col;
  for(row = 0; row <= len1; row++){
    m[row] = [];
    for(col = 0; col <= len2; col++){
      m[row][col] = 0;
    }
  }

  var i, j;
  for(i = 0; i < len1; i++){
    for(j = 0; j < len2; j++){
      if(str1[i] === str2[j]){
        if(m[i][j] === 0){
          m[i+1][j+1] = 1;
        } else {
          m[i+1][j+1] = m[i][j] + 1;
        }
        if(m[i+1][j+1] > longestCS){
          longestCS = m[i+1][j+1];
        }
      } else {
        m[i+1][j+1] = 0;
      }
    }
  }
  return longestCS;
};

var getType = function(text, item) {
  var length = item.simpleName.length;
  var lengthMatch = lcs(item.simpleName, text);
  return obj = {
    rank: (lengthMatch*100.0)/length,
    _id: item._id,
    name: item.realName
  }
};

var getId = function(words, list) {
  return list.map(utils.partial(getType, words))
          .sort(sortDescByRank)[0]._id;
};

var getTypeFromPromise = function(text, model) {
  return Q.promise(function(resolve, reject) {
    if (!text || !text.length)
      return resolve(null);
    model.getList(function(err, list) {
      if (err) return reject(err);
      if (!list || !list.length) {
        reject('no list found');
      }
      resolve(getId(text, list));
    })
  })
};

var getMovieFromCinema = function(text, id) {
  return Q.promise(function(resolve, reject) {
    if (!text || !text.length)
      return resolve(null);
    cinema
      .getMovies(id)
      .then(function(theater) {
        if (!theater.movies || !theater.movies.length) {
          reject('no list found');
        }
        resolve(getId(text, theater.movies));
      })
  })
};

var getMovie = function(text) {
  return getTypeFromPromise(text, models.movie);
};

var getCinema = function(text) {
  return getTypeFromPromise(text, models.theater);
};

var getQuery = function(text) {
  return getTypeFromPromise(text, models.query);
};

var parseQueryFromTweet = function(text) {
  text =  utils.cleanText(text);
  return Q.promise(function(resolve, reject) {
    getCinema(text).then(function(cinemaId) {
      getMovieFromCinema(text, cinemaId)
        .then(function(movieId) {
          resolve({
            movie: movieId,
            theater: cinemaId
        })
      });;
    })
  })
};

var findMovieTimes = function(fields) {
  return Q.promise(function(resolve, reject) {
    getCinema(fields.cinema).then(function(cinemaId) {
      getMovieFromCinema(fields.movie, cinemaId)
        .then(function(movieId) {
          resolve({
            movie: movieId,
            theater: cinemaId
          })
        });;
    })
  })
};
/*
var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.mongoConnection);

var data = {
  cinema: 'cinemark',
  movie: 'intocables'
};

findMovieTimes(data)
  .then(models.schedule.getOne)
  .then(function(gg){
    console.log(gg);
  });
*/
/*
parseQueryFromTweet('Larcomar climas')
  .then(function(res) {
    console.log(res);
  });
*/
module.exports = {
  parseQueryFromTweet: parseQueryFromTweet,
  getMovie: getMovie,
  getCinema: getCinema,
  getQuery: getQuery,
  findMovieTimes: findMovieTimes
}
