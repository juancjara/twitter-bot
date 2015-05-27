var models = require('../models');

function parseFields(data) {
  var patterns = {
    cinema: /c#\w+/ig,
    movie: /m#\w+/ig,
    request: /r#\w+/ig
  }
  var response = {
    cinema: null,
    movie: null,
    request: null
  }
  for (var k in patterns) {
    var arr = patterns[k].exec(data);
    if (arr) response[k] = arr[0].substring(2);
  }

  return response;
}

function executeQuery(queryParams) {
  var queryFields = {};
  queryFields.movie = models.movie.findOne(queryParams.movie);
  queryFields.theater = models.theater.findOne(queryParams.cinema);
  return models.schedule.find(queryFields);
}

function queryTweet(parseTweet) {
  var queryFields = parseFields(parseTweet);
  return executeQuery(queryFields);
}

module.exports = {
  queryTweet: queryTweet
}