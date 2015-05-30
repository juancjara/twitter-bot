var schedule = {
  iterable: false,
  getList: function() {
    var times = [
      {
        movie: 'm1',
        cinema: 0,
        times: '[3D] 12:15 3:00 5:45 8:30'
      },
      {
        movie: 'm1',
        cinema: 1,
        times: '12:15 3:00 5:45 8:30 [IMAX] 12:15 3:00 5:45 8:30'
      },
      {
        movie: 'm2',
        cinema: 0,
        times: '[IMAX] 12:15 3:00 5:45 8:30'
      },
      {
        movie: 'm2',
        cinema: 1,
        times: '12:15 3:00 5:45 8:30'
      },
      {
        movie: 'm3',
        cinema: 0,
        times: '[3D] 10.30'
      },
      {
        movie: 'm3',
        cinema: 1,
        times: '[IMAX] 12:15 3:00 3:30 4:00 5:00 5:30 5:45 6:00 6:30 7:30 8:00' +
               ' 8:30 9:30 10:20 [3D] 12:15 3:00 3:30 4:00 5:00 5:30 5:45 6:00 6:30 7:30 8:00' +
               ' 8:30 9:00 9:15 9:30 10:00'
      },
    ]
    return times;
  },
  find: function(params) {
    console.log(params);
    var times = schedule.getList();
    for( var i = 0, l = schedule.getList().length; i < l; i++) {
      if (times[i].movie === params.movie.id && 
          times[i].cinema === params.cinema.id)
        return times[i].times;
    }
    return null;
  }
}

module.exports = schedule;