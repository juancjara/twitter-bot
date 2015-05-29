var movie = {
  iterable: true,
  getList: function() {
    var movies = [
      {
        id: 'm1',
        realName: 'Tomorrowland',
        similars: ['tomorrowland'],
        type: 'movie'
      },
      {
        id: 'm2',
        realName: 'Pitch Perfect 2',
        similars: ['pitch', 'perfect', '2', 'pitchperfect2'],
        type: 'movie'
      },
      {
        id: 'm3',
        realName: 'Mad Max: Fury Road',
        similars: ['mad', 'max', 'fury', 'road'],
        type: 'movie'
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