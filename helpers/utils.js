var getField = function(tweet, path, def) {
  var paths = path.split('.');
  var field = JSON.parse(JSON.stringify(tweet));

  for (var i = 0; i < paths.length; i++) {
    if (paths[i] in field) {
      field = field[paths[i]];
    } else {
      return def;
    }
  };

  return field;
};

var cleanText = function(text) {
  return cleanSpaces(removeCaracters(text));
};

var cleanSpaces = function(text) {
  return text.replace(/ /g, '');
};

var removeCaracters = function(text) {
  return text.replace(/[:\.',&\\\(\)]|( - )/g, '').toLowerCase()
};

var uniqueArray = function(arr, getIdentifier) {
  var dic = {};
  return arr.filter(function(item) {
    var id = getIdentifier(item);
    return dic.hasOwnProperty(id) ? false: (dic[id] = true); 
  })
};

var createSimilars = function(text) {
  var temp = removeCaracters(text).split(' ');
  var similars = temp.filter(function(item) {
    return item.length > 0;
  });
  return similars;
};

//TODO change to use Object.keys
var dicToArray = function(dic) {
  var arr = [];
  for(var k in dic) {
    arr.push(dic[k]);
  }
  return arr;
};

var groupArray = function(arr, groupBy, mix) {
  var dic = {};
  var id;
  for(var i = 0, l = arr.length; i < l; i++) {
    if (arr[i].rank < 0) continue;
    id  = groupBy(arr[i]);
    dic[id] = mix(dic[id], arr[i]);
  }
  return dicToArray(dic);
};

var argsToArray = function(args) {
  return args = Array.prototype.slice.call(args);
};

var partial = function(fn) {
  var pastArgs = argsToArray(arguments).slice(1);
  return function() {
    var newArgs = argsToArray(arguments);
    return fn.apply(null, pastArgs.concat(newArgs));
  }
};

module.exports = {
  groupArray: groupArray,
  getField: getField,
  dicToArray: dicToArray,
  createSimilars: createSimilars,
  argsToArray: argsToArray,
  partial: partial,
  cleanText: cleanText,
  cleanSpaces: cleanSpaces
};
