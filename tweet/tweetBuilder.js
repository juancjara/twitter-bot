var format = require('string-template');
var utils = require('../helpers/utils');

var getSpace = function(max, fields, template) {
  fields.content = '';
  return max - format(template, fields).length;
};

var splitMsg = function(fields, spaceAvailable, template) {
  //var msgTemplate = 'pelicula: {movie} cine: {theater} -> {msg}';
  var message = format(template, fields);
  var msgs = [];
  var len = message.length;
  var i = Math.min(spaceAvailable, len);
  var last = 0;

  while (last < len) {
    var car = message.charAt(i);
    if (i >= len || car === ' ') {
      msgs.push(message.substring(last, i))
      last = i;
      i = Math.min(last + spaceAvailable, len);
    } else {
      i--;
    }
  }

  return msgs;
};

var generateLongTweets = function(maxSpace, fields, bodyTemplate) {
  var tweets = [];
  var mainTemplate = '@{to} {content} {uniqueField}';
  var spaceAvailable = getSpace(maxSpace, fields, mainTemplate);
  var arrMsg = splitMsg(fields, spaceAvailable, bodyTemplate);
  arrMsg.forEach(function(msg) {
    fields.content = msg;
    tweets.push(format(mainTemplate, fields));
  })

  return tweets;
};

var moviesPost = function(to, queryInfo) {
  var fields = {
    to: to,
    msg: queryInfo.movies,
    cinema: queryInfo.cinema
  };
  return createTweets(fields, templates.movieList);
};

var createTweets = function(fields, templates) {
  fields.uniqueField = utils.generateUniqueField();
  var maxSpace = 140;
  var tweets = [];
  var oneTweet = format(templates.singleTweet, fields);

  if (maxSpace >= oneTweet.length) {
    tweets.push(oneTweet);
  } else {
    tweets = generateLongTweets(maxSpace, fields, templates.multipleTweets);
  }
  return tweets;
};

var templates = {
  times: {
    singleTweet: '@{to} pelicula: {movie} cine: {cinema} -> {msg} ' +
      '{uniqueField}',
    multipleTweets: 'pelicula: {movie} cine: {cinema} -> {msg}'
  },
  movieList: {
    singleTweet: '@{to} cine:{cinema} -> {msg} {uniqueField}',
    multipleTweets: 'cine: {cinema} -> {msg}'
  },
  general: {
    singleTweet: '@{to} {msg} {uniqueField}',
    multipleTweets: '{msg}'
  }
};

var createPosts = function(to, queryInfo) {
  var fields = {
    to: to,
    msg: queryInfo.schedule,
    movie: queryInfo.movie,
    cinema: queryInfo.cinema
  };
  return createTweets(fields, templates.times);
};

var createSimpleMsg = function(to, msg) {
  var fields = {
    to: to,
    msg: msg
  };
  return createTweets(fields, templates.general);
};

module.exports = {
  createPosts: createPosts,
  createSimpleMsg: createSimpleMsg,
  moviesPost: moviesPost
};

