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

module.exports = {
  groupArray: groupArray,
  getField: getField,
  dicToArray: dicToArray
};