var movie = {
  getList: function() {
    var movies = [
      {
        id: 0,
        realName: 'Asu mare 2',
        similars: ['asu', 'mare', '2', 'asumare2']
      },
      {
        id: 1,
        realName: 'Decisión Mortal',
        similars: ['decision', 'mortal', 'decisionmortal']
      }
    ];
    return movies;
  },
  findOne: function(clue) {
    clue = clue || '';
    var bestMatch = -1;
    var found = null;
    var movies = movie.getList();

    movies.map(function(movie) {
      var matches = movie.similars.reduce(function(acc, b) {
        var equal = clue.search(b) != -1 ? 1: 0;
        return acc + equal;
      }, 0);
      if (bestMatch < matches) {
        matches = bestMatch;
        found = movie;
      }
    })
    
    return found;
  }
}

module.exports = movie;