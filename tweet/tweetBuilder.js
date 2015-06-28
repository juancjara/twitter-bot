var format = require('string-template');

var getSpace = function(max, fields, template) {
  fields.content = '';
  return max - format(template, fields).length;
};

var splitMsg = function(fields, spaceAvailable) {
  var msgTemplate = 'movie: {movie} theater: {theater} -> {msg}';  
  var message = format(msgTemplate, fields);
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

function generateLongTweets(maxSpace, fields) {
  var tweets = [];
  var mainTemplate = '@{to} {content} {uniqueField}';
  var spaceAvailable = getSpace(maxSpace, fields, mainTemplate);
  var arrMsg = splitMsg(fields, spaceAvailable);

  arrMsg.forEach(function(msg) {
    fields.content = msg;
    tweets.push(format(mainTemplate, fields));
  })

  return tweets;
}


function createPosts(to, queryInfo) {
  var fields = {
    to: to,
    msg: queryInfo.schedule,
    count: 1,
    movie: queryInfo.movie,
    theater: queryInfo.theater,
    uniqueField: '*' + (new Date()).getMilliseconds()
  }

  var maxSpace = 140;
  var tweets = [];

  var oneTweetTemplate = '@{to} movie:{movie} theater:{theater} -> {msg} ' + 
                         '{uniqueField}';
  var oneTweet = format(oneTweetTemplate, fields);

  if (maxSpace >= oneTweet.length) {
    tweets.push(oneTweet);
  } else {
    tweets = generateLongTweets(maxSpace, fields);
  }
  return tweets;
}

function createHelpMsg(to) {
  var fields = {
    to: to,
    msg: 'Hey, tweet movie and cinema to get the schedule',
    uniqueField: '*' + (new Date()).getMilliseconds()
  }

  var template = '@{to} {msg} {uniqueField}';
  return format(template, fields);
}

module.exports = {
  createPosts: createPosts,
  createHelpMsg: createHelpMsg
}