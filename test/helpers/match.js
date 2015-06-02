var should = require('chai').should();

var match = require('../../helpers/match');

describe('match', function() {

  var movies = [
    {
      id: 'm1',
      realName: 'Tomorrowland',
      simpleName: 'tomorrowland',
      type: 'movie'
    },
    {
      id: 'm2',
      realName: 'Pitch Perfect 2',
      simpleName: 'pitchperfect2',
      type: 'movie'
    },
    {
      id: 'm3',
      realName: 'Mad Max: Fury Road',
      simpleName: 'madmaxfuryroad',
      type: 'movie'
    }
  ];

  var cinemas = [
      {
        id: 0,
        realName: 'AMC Empire 25',
        simpleName: 'amcempire25',
        type: 'cinema'
      },
      {
        id: 1,
        realName: 'Alamo Drafthouse Littleton',
        simpleName: 'alamodrafthouselittleton',
        type: 'cinema'
      }
    ];  

  var words = 'pitch movie mad max alamo cinema give me times'.split(' ');

  it('get Movie', function() {
    var movieExpected = 'Mad Max: Fury Road'
    movieExpected.should
      .equal(match.getMovie(words).name);
  });

  it('get cinema', function() {
    var cinemaExpected = 'Alamo Drafthouse Littleton';
    cinemaExpected.should
      .equal(match.getCinema(words).name);
  })

  it('get query word', function() {
    var queryWordExpected = 'times';
    queryWordExpected.should
      .equal(match.getQuery(words).name);
  });

});