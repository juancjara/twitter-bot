var models = require('../models');
var utils = require('./utils');

function sortDescByRank(a, b) {
  return b.rank - a.rank;
}

function getRank(word, acc, item) {
  var same = word.search(item) != -1 ? 1: 0;
  return acc + same;
}

function findBestMatch(word, item) {
  var rank = item.simpleName.search(word) != -1 ? 1:0;
  return {
    item: item,
    rank: rank
  };
}
//iterate over list and find best matching
function findMatch(list, word) {
  var best = list.map(utils.partial(findBestMatch, word))
              .sort(sortDescByRank)[0];
  return best;
}

function getType(words, list) {
  var matches = words.map(utils.partial(findMatch, list));

  function getIdentifier(elem) {
    return elem.item.id;
  }

  function mix(a, b) {
    a = a || {rank: 0};
    return newObj = {
      rank: a.rank + b.rank,
      id: b.item.id,
      type: b.item.type,
      name: b.item.realName
    }
  }

  var grouped = utils.groupArray(matches, getIdentifier, mix);
  return grouped.sort(sortDescByRank)[0];
}

function getMovie(words) {
  return getType(words, models.movie.getList());
}

function getCinema(words) {
  return getType(words, models.theater.getList());
}

function getQuery(words) {
  return getType(words, models.query.getList());
}

function parseQueryFromTweet(text) {
  words = text.split(' ');
  var fields = {
    movie: getMovie(words),
    cinema: getCinema(words),
    query: getQuery(words)
  }
  return fields;
}

module.exports = {
  parseQueryFromTweet: parseQueryFromTweet
}

console.log(parseQueryFromTweet('pitch movie mad max df12453sf alamo cinema give me schedule'));