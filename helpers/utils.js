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

module.exports = {
  getField: getField
};