var Q = require('q');
var models = require('../models');
var utils = require('./utils');

function sortDescByRank(a, b) {
  return b.rank - a.rank;
}

function lcs(str1, str2) {
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
}

function getType(text, item) {
  var length = item.simpleName.length;
  var lengthMatch = lcs(item.simpleName, text);
  return obj = {
    rank: (lengthMatch*100.0)/length,
    _id: item._id,
    name: item.realName
  }
}

function getId(words, list) {
  return list.map(utils.partial(getType, words))
          .sort(sortDescByRank)[0]._id;
}

function getTypeFromPromise(text, model) {
  return Q.promise(function(resolve, reject) {
    model.getList(function(err, list) {
      if (err) return reject(err);
      if (!list || !list.length) {
        reject('no list found');
      }
      resolve(getId(text, list));
    })
  })
} 

function getMovieFromCinema(text,id) {
  return Q.promise(function(resolve, reject) {
    models.theater.getMovies(id, function(err, theater) {
      if (err) return reject(err);
      if (!theater.movies || !theater.movies.length) {
        reject('no list found');
      }
      resolve(getId(text, theater.movies));
    })    
  })
}

function getMovie(text) {
  return getTypeFromPromise(text, models.movie);
}

function getCinema(text) {
  return getTypeFromPromise(text, models.theater);
}

function getQuery(text) {
  return getTypeFromPromise(text, models.query);
}

function parseQueryFromTweet(text) {
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
  
  /*var tasks = [
    getCinema(text)
  ];

  return Q.promise(function(resolve, reject) {
    Q.all(tasks)
      .then(function(results) {
        resolve({
          movie: results[0],
          theater: results[1],
          query: 'schedule'
        });
      },reject)    
  })*/
}

/*
var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.mongoConnection);

parseQueryFromTweet('Larcomar climas')
  .then(function(res) {
    console.log(res);
  });
*/
module.exports = {
  parseQueryFromTweet: parseQueryFromTweet,
  getMovie: getMovie,
  getCinema: getCinema,
  getQuery: getQuery
}
