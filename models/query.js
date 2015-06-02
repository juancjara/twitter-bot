var query = {
  getList: function(cb) {
    var words = [
      {
        id: 'q1',
        realName: 'times',
        simpleName: 'scheduleprogramtimes',
        type: 'query'
      }
    ];
    return cb(null, words);
  }
}

module.exports = query;