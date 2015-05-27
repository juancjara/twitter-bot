var Twit = require('twit');
var utils = require('../helpers/utils');
var tweetHandler = require('./tweetHandler');
var config = require('../config');

var T = new Twit(config.twitter);

function formatPost(tweetInfo, response) {
  return '@' + tweetInfo.screen_name + ' ' + response + 
    ' ' + (new Date()).getMilliseconds();
} 

function stream(hashtag) {
  var stream = T.stream('statuses/filter', { track: hashtag});
  stream.on('tweet', function (tweet) {
    console.log('------------------on tweet --------------------------')
    var pt = parseTweet(tweet, ['id', 'name', 'screen_name', 'text', 'hashtags']);
    var formatResponse = formatPost(pt, tweetHandler.queryTweet(pt));
    post(formatResponse);
  })
}

function parseTweet(tweet, fields) {
  var parsed = {};
  var mapFields = {
    id: 'id',
    name: 'user.name',
    screen_name: 'user.screen_name',
    text: 'text',
    hashtags: 'entities.hashtags'
  }
  fields.map(function(k) {
    if (k in mapFields) {
      parsed[k] = utils.getField(tweet, mapFields[k], 'none '+k);
    }
  })
  
  return parsed;
}

//add number?
//verify if post was already sent / sent already

function post(message) {
  T.post('statuses/update', {status: message},
    function(err, data, response) {
      if (err) return console.log(err);
      console.log('posted', message);
    }
  )
}

module.exports = {
  post: post,
  listenStream: stream
}