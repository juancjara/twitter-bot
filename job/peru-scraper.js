'user strict';

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

module.exports = scrap;
scrap.scrap = scrap;
