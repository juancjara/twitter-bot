var models = require('../models');
var utils = require('./utils');

//find type (movie, cinema, query word) and elem
function findType(word) {
  var arrModels = utils.dicToArray(models);
  var bestMatch = arrModels.reduce(function(best, model) {
    if (!model.iterable) return best;
    var tempBest = findMatch(model.getList(), word);
    if (tempBest.rank && best.rank < tempBest.rank) {
      return tempBest;
    }
    return best;
  }, {rank: -1});
  return bestMatch;
}

function sortDescByRank(a, b) {
  return b.rank - a.rank;
}

function getRank(clue, acc, item) {
  var same = clue.search(item) != -1 ? 1: 0;
  return acc + same;
}

function getBestRank(clue, item) {
  var rank = item.similars.reduce(utils.partial(getRank, clue), 0);
  return {
    rank: rank,
    item: item
  }
}

//iterate over list and find best matching
function findMatch(list, clue) {
  var best = list.map(utils.partial(getBestRank, clue))
              .sort(sortDescByRank)[0];
  console.log(best);
  return best;
}

function findBestMatch(list, word) {
  var best = list.map(utils.partial(getBestRank, clue))
              .sort(sortDescByRank)[0];
  console.log(best);
  return best; 
}

function parseQueryFromTweet(text) {
  words = text.split(' ');
  var tokens = words.map(findType);
  //var movies = words.map(utils.partial(findType, models.movie.getList()));
  var fields = {}
  function getId(elem) {
    return elem.item.id;
  }
  function mix(a, b) {
    a = a || {rank: 0};
    var newObj = {
      rank: a.rank + b.rank,
      id: b.item.id,
      type: b.item.type
    }
    return newObj;
  }

  var groupedById = utils.groupArray(tokens, getId, mix);
  groupedById.forEach(function(elem) {
    var type = elem.type;
    if (!fields[type] || fields[type].rank < elem.rank) {
      fields[type] = {
        rank: elem.rank,
        id: elem.id
      }
    }
  })
  return fields;
}

module.exports = {
  parseQueryFromTweet: parseQueryFromTweet
}

//'pitch movie mad max on alamo drafthouse give me schedule'
//findMatch(models.theater.getList(), 'alamo');
//console.log(parseQueryFromTweet('mad'))
//console.log(parseQueryFromTweet('pitch movie mad max on alamo cinema give me schedule'));
console.log('getWordType', findBestMatch(models.movie.getList(), 'mad'));