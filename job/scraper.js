//api movies
var cheerio = require('cheerio');
var request = require('request');

var scraper = function() {
  var url = 'http://www.imdb.com/showtimes/';
  function scrap(cb) {
    request(url, function(err, res, html) {
      if (err) cb(err);
      cb(null, loadCheerio(html));
    })
  }

  function extractShowTimes($types) {
    var schedule = '';
    $types.each(function() {
      var $schedule = $(this);
      var typeShow = $schedule.text().replace(/(Showtimes)|:/g, '').trim();
      var times = $schedule.next().text()
                    .replace(/ |\n|(Get Tickets)/g, '').split('|');
      var arraySchedule = times.map(function(item) {
        return item.trim();
      })
      var templateTypeShow = typeShow.length > 0 ? '[' + typeShow + '] ': '';
      schedule += ' ' + templateTypeShow + arraySchedule.join(' ');  
    })
    return schedule.trim();
  }

  function iterateMovies($movies) {
    var movies = [];

    $movies.each(function() {
      var $movie = $(this);
      var movieName = $('h4', $movie).text().replace(/\(.*\)/g, '').trim();
      var $types = $('.li_group', $movie);
      movies.push({
        name: movieName,
        schedule: extractShowTimes($types)
      });
    })

    return movies;
  }

  function iterateCinemas($cinemas) {
    var cinemas = [];

    $('#cinemas-at-list > .list_item').each(function() {
      var $cinema = $(this);
      var cinemaName = $cinema.children().first().text().trim();
      var movies = iterateMovies($('.list_item', $cinema));
      cinemas.push({
        name: cinemaName,
        movies: movies
      })
    })

    return cinemas;
  }

  function loadCheerio(html) {
    $ = cheerio.load(html);
    var location = $('.location-display').text();
    var cinemas = iterateCinemas($('#cinemas-at-list > .list_item'));
    return cinemas;
  }

  return {
    scrap: scrap
  }
}();

module.exports = scraper;