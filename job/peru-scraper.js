'user strict';

var Q = require('q');
var cheerio = require('cheerio');
var format = require('string-template');
var request = require('request');

var utils = require('../helpers/utils');

var getSchedule = function(text) {
  return text.replace(/\n/g, '').split(' ')
          .filter(function(item) {return item !== ''});
};

var orderTimes = function(a , b) {
  return a > b;
}

var formatSchedule = function formatSchedule(schedules) {
  var dic = {};

  schedules.forEach(function(item) {
    if (!(item.types in dic)) {
      dic[item.types] = {
        types: item.types,
        times: []
      };
    }
    dic[item.types].times = dic[item.types].times.concat(item.times);
  })

  var template = '[{0}] {1}';
  var arrSchedule = utils.dicToArray(dic);
  return arrSchedule.map(function(item) {
    return format(template, item.types, item.times.sort(orderTimes).join(' '));
  }).join(' ');

};

var getMovies = function getMovies($movies) {
  var movies = {};

  $movies.each(function() {
    var $children = $(this).find('.first-col').children().first();
    var types = $children.first().nextAll().text();
    var name = $children.first().text().replace(/\([^\)]+\)/g, '').trim();
    var schedule = getSchedule($children.parent().next().text()); 
    if (!(name in movies)) {
      movies[name] = {
        name: name,
        schedule: []
      };
    }
    movies[name].schedule.push({types: types, times: schedule});  
  })

  return utils.dicToArray(movies).map(function(item) {
    item.schedule = formatSchedule(item.schedule);
    return item;
  });
}

var getCinemas = function getCinemas($theathers) {
  var cinemas = [];

  $theathers.each(function() {
    cinemas.push({
      name: $(this).find('h3').text(),
      movies: getMovies($(this).find('tbody tr'))
    });
  })

  return cinemas;
};

var loadCheerio = function loadCheerio(html) {
  $ = cheerio.load(html);
  var $theathers = $('[rel="theater-box"]');
  return getCinemas($theathers);
};

var scrap = function scrap(url, cb) {
  request(url, function(err, res, html) {
    if (err) return cb(err);
    cb(null, loadCheerio(html));
  });
};

//cineplaza jesus maria

var scrapUrl = function(url, fn) {
  request(url, function(err, res, html) {
    if (err) return console.log(err);
    fn(cheerio.load(html));
  })
};

var cinePlazaJesusMaria = function() {

  var removeDuplicateMovies = function(movies) {
    var dic = {};

    movies.forEach(function(movie) {
      if (movie.name in dic) {
        dic[movie.name].times += ' ' + movie.times;
      } else {
        dic[movie.name] = {
          name: movie.name,
          times: movie.times
        }
      }
    })

    var arr = [];
    Object.keys(dic).forEach(function(k) {
      arr.push(dic[k]);
    })
    return arr;
  };

  var extractMovieTimes = function(urlMovie) {
    return Q.promise(function(resolve, reject) {
      scrapUrl(urlMovie, function(dom) {
        var $ = dom;
        var times = [];

        $('tr').slice(1).each(function() {
          times = times.concat($(this).children().slice(1)
                               .text()
                               .replace(/[A-Z]*/g, '')
                               .replace(/\s+/g, ' ')
                               .trim()
                               .split(' '));
        })

          var title = $('h1').text();
        var timesWithType = parseMovieType(title) + ' ' + times.sort(orderTimes).join(' ');
        var obj = {
          name: parseMovieName(title),
          times: timesWithType
        };
        resolve(obj);
      })
    })
  };

  var parseMovieName = function(text) {
    return text.split(' ').slice(0, -1).join(' ');
  };

  var parseMovieType = function(text) {
    var types = text.split(' ').slice(-1)[0].split('-');
    var language = types[1] === 'DOBLADA'? 'Dob': 'Sub';
    return '[' + types[0].replace('2D', '') + language + ']';
  };

  var extractUrlMovies = function(dom) {
    var urls = [];

    var $ = dom;
    $('#jumpMenu').first().children()
      .each(function() {
        urls.push($(this).val());
      });

    return urls
      .filter(function(url) {
        return url !== undefined;
      });
  };

  var scrap = function() {
    return Q.promise(function(resolve) {
      var baseUrl = 'http://www.multicinesplazajesusmaria.com/';

      scrapUrl(baseUrl, function(dom) {
        var moviesUrl = extractUrlMovies(dom);
        var tasks = moviesUrl.map(function(url) {
          return extractMovieTimes(baseUrl + url);
        });
        Q.all(tasks).then(function(movies) {
          resolve(removeDuplicateMovies(movies));
        });
      })
    })
  };

  return {scrap: scrap};
}();

module.exports = scrap;
scrap.scrap = scrap;
scrap.scrapJesusMaria = cinePlazaJesusMaria.scrap;
