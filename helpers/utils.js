function getField(tweet, path, def) {
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
}

function cleanText(text) {
  return removeCaracters(text).replace(/  +/g, ' ');
}

function cleanSpaces(text) {
  return text.replace(/ /g, '');
}

function removeCaracters(text) {
  return text.replace(/[:\.',&\\]|( - )/g, '').toLowerCase()
}

function uniqueArray(arr, getIdentifier) {
  var dic = {};
  return arr.filter(function(item) {
    var id = getIdentifier(item);
    return dic.hasOwnProperty(id) ? false: (dic[id] = true); 
  })
}

function createSimilars(text) {
  var temp = removeCaracters(text).split(' ');
  var similars = temp.filter(function(item) {
    return item.length > 0;
  });
  return similars;
}

function dicToArray(dic) {
  var arr = [];
  for(var k in dic) {
    arr.push(dic[k]);
  }
  return arr;
}

function groupArray(arr, groupBy, mix) {
  var dic = {};
  var id;
  for(var i = 0, l = arr.length; i < l; i++) {
    if (arr[i].rank < 0) continue;
    id  = groupBy(arr[i]);
    dic[id] = mix(dic[id], arr[i]);
  }
  return dicToArray(dic);
}

function argsToArray(args) {
  return args = Array.prototype.slice.call(args);
}

function partial(fn) {
  var pastArgs = argsToArray(arguments).slice(1);
  return function() {
    var newArgs = argsToArray(arguments);
    return fn.apply(null, pastArgs.concat(newArgs));
  }
}

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