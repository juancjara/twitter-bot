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
    rank: length - (length - lengthMatch),
    _id: item._id
  }
}


function getId(words, list) {
  return list.map(utils.partial(getType, words))
          .sort(sortDescByRank)[0]._id;
}

function getTypeFromPromise(words, model) {
  return Q.promise(function(resolve, reject) {
    model.getList(function(err, list) {
      if (err) return reject(err);
      resolve(getId(words, list));
    })
  })
} 

function getMovie(words) {
  return getTypeFromPromise(words, models.movie);
}

function getCinema(words) {
  return getTypeFromPromise(words, models.theater);
}

function getQuery(words) {
  return getTypeFromPromise(words, models.query);
}

function parseQueryFromTweet(text, cb) {
  var tasks = [
    getMovie(text),
    getCinema(text),
    getQuery(text)
  ];

  Q.all(tasks)
    .then(function(results) {
      cb(null, {
        movie: results[0],
        cinema: results[1],
        query: results[2]
      });
    },cb)
}

module.exports = {
  parseQueryFromTweet: parseQueryFromTweet,
  getMovie: getMovie,
  getCinema: getCinema,
  getQuery: getQuery
}

parseQueryFromTweet('pitch movie mad max alamo cinema schedule', function(err, gg){
  console.log(gg);
});

//substack