var models = require('../models');
var utils = require('./utils');

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

function findMatch(list, clue) {
  var initial = {
    rank: -1,
    item: null
  }
  var best = list.reduce(function(actualBest, item) {
    var rank = item.similars.reduce(function(acc, b) {
      var same = clue.search(b) != -1 ? 1: 0;
      return acc + same;
    }, 0);

    if (actualBest.rank < rank) {
      return {
        rank: rank,
        item: item
      }
    }

    return actualBest;
  }, initial);

  return best;
}
//'pitch movie mad max on alamo drafthouse give me schedule'


function extractFields(text) {
  words = text.split(' ');
  var tokens = words.map(function(word) {
    match = findType(word);
    return match;
  });
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
  groupedById.map(function(elem) {
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
  extractFields: extractFields
}