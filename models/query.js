var query = {
  iterable: true,
  getList: function() {
    var words = [
      {
        id: 'q1',
        realName: 'schedule',
        similars: ['schedule', 'program', 'time'],
        type: 'query'
      }
    ];
    return words;
  }
}

module.exports = query;