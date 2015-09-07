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
  return {
    rank: (lengthMatch*100.0)/length,
    _id: item._id,
    name: item.realName
  };
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

var calculateRank = function(words, item) {
  //todo change split item
  var wordsToCompare = utils.cleanText(item.realName).split(' ');
  var rank = 0;
  for (var i = 0, len = words.length; i < len; i++) {
    for (var j = 0, len2 = wordsToCompare.length; j < len2; j++) {
      if (words[i] === wordsToCompare[j]) {
        rank++;
        break;
      }
    }
  }

  return {
    rank: rank / len2,
    _id: item._id,
    name: item.realName
  }
};

var getBestMatch = function(text, list) {
  //todo clean text before split
  var words = utils.cleanText(text).split(' ');
  var matches = list
    .map(utils.partial(calculateRank, words))
    .filter(function(item) {
      return item.rank > 0;
    })
    .sort(sortDescByRank);
  return matches.length > 0 ? matches[0]._id: null;
};

var getSomething = function(text, model) {
  return Q.promise(function(resolve, reject) {
    if (!text || !text.length) {
      return resolve(null);
    }
    model.getList(function(err, list) {
      if (err) return reject(console.log(err));
      if (!list || !list.length) {
        return reject('no list found');
      }
      resolve(getBestMatch(text, list));
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

var parseQueryFromTweet = function(fields) {
  //text =  utils.cleanText(text);
  return Q.promise(function(resolve, reject) {
    getCinema(fields.cinema).then(function(cinemaId) {
      if (!cinemaId) {
        return resolve({
          movie: null,
          theater: null
        });
      }
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

var getMovieMatch = function(text) {
  return getSomething(text, models.movie);
};

var getCinemaMatch = function(text) {
  return getSomething(text, models.theater);
};

var findMovieAndCinema = function(fields) {
  return Q.promise(function(resolve, reject) {
    getCinemaMatch(fields.cinema).then(function(cinemaId) {

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

getMovieMatch('Magallanes')
  .then(function(res) {
    console.log(res);
  })
*/

module.exports = {
  parseQueryFromTweet: parseQueryFromTweet,
  getMovie: getMovie,
  getCinema: getCinema,
  getQuery: getQuery,
  findMovieAndCinema: findMovieAndCinema,
  getMovieMatch: getMovieMatch,
  getCinemaMatch: getCinemaMatch
}
