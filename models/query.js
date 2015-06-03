var query = {
  getList: function(cb) {
    var words = [
      {
        _id: 'q1',
        realName: 'times',
        simpleName: 'schedule program times',
        type: 'query'
      }
    ];
    return cb(null, words);
  }
}

module.exports = query;