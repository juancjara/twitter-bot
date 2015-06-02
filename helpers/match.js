var Q = require('q');
var models = require('../models');
var utils = require('./utils');

function sortDescByRank(a, b) {
  return b.rank - a.rank;
}
/*
function getRank(word, acc, item) {
  var same = word.search(item) != -1 ? 1: 0;
  return acc + same;
}
//anony
function getType(word, item) {
  var rank = item.simpleName.search(word) != -1 ? 1:0;
  return {
    item: item,
    rank: rank
  };
}

//return movie


function findMatch(list, word) {
  var best = list.map(utils.partial(getType, word))
              .sort(sortDescByRank)[0];
              //undefied filter
  return best;
}

*/

function lcs(str1, str2) {
  var longestCS = 0;
  
  var table = [];
  var len1 = str1.length;
  var len2 = str2.length;
  var row, col;
  for(row = 0; row <= len1; row++){
    table[row] = [];
    for(col = 0; col <= len2; col++){
      table[row][col] = 0;
    }
  }
  
  var i, j;
  for(i = 0; i < len1; i++){
    for(j = 0; j < len2; j++){
      if(str1[i]==str2[j]){
        if(table[i][j] == 0){
          table[i+1][j+1] = 1;
        } else {
          table[i+1][j+1] = table[i][j] + 1;
        }
        if(table[i+1][j+1] > longestCS){
          longestCS = table[i+1][j+1];
        }
      } else {
        table[i+1][j+1] = 0;
      }
    }
  }
  return longestCS;
}

function getGG(text, item) {
  var length = item.simpleName.length;
  var lengthMatch = lcs(item.simpleName, text);
  return length - (length - lengthMatch);
}


function getId(words, list) {
  return list.map(utils.partial(getGG))
          .sort(sortDescByRank)[0]._id;
/*
  var matches = words.map(utils.partial(findMatch, list));
  function getIdentifier(elem) {
    return elem.item.id;
  }

  function mix(a, b) {
    a = a || {rank: 0};
    return newObj = {
      rank: a.rank + b.rank,
      id: b.item.id,
      name: b.item.realName
    }
  }

//2 reduces
  var grouped = utils.groupArray(matches, getIdentifier, mix);
  return grouped.sort(sortDescByRank)[0]._id;
  */
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
/*
parseQueryFromTweet(
  'pitch movie mad max alamo cinema give me times',
  function(err, fields) {
    if (err) return console.log('err', err)
    console.log(fields)
});*/

console.log(runThing('mad max fury road','mad max fury road'));

//substack