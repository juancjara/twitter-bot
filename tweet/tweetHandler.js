var Q = require('q');

var Twit = require('twit');

var models = require('../models');
var utils = require('../helpers/utils');
var config = require('../config');
var match = require('../helpers/match')
var tweetBuilder = require('./tweetBuilder');

var T = new Twit(config.twitter);

function removeHashTag(text) {
  return text.replace(/#\w+/i, '');
}

function parseFieldsFromTweet(tweet, fields) {
  var parsed = {};
  var mapFields = {
    id: 'id',
    name: 'user.name',
    screen_name: 'user.screen_name',
    text: 'text',
    hashtags: 'entities.hashtags'
  }

  fields.forEach(function(k) {
    if (k in mapFields) {
      parsed[k] = utils.getField(tweet, mapFields[k], 'none '+k);
    }
  })
  
  return parsed;
}

function getLocation(id) {
  console.log(getLocation);
  return Q.promise(function (resolve, reject) {
    T.get('statuses/show/:id', {id: id}, function (err, data, response) {
      console.log(err, id);
      console.log(data);
    });
  });
}

function findScheduleAndPost(msg, screen_name) {

  match.parseQueryFromTweet(msg)
    .then(models.schedule.getOne)
    .then(function(data) { 
      if(!data.schedule) {
        data.schedule = 'No schedule found';
      };
      var posts = tweetBuilder.createPosts(screen_name, data);
      posts.forEach(function(post) {
        postTweet(post);
      })
    });
}

function handleNewTweet(tweet) {
  console.log('------------------on tweet --------------------------');
  var tweetFields = parseFieldsFromTweet(tweet,
                     ['id', 'name', 'screen_name', 'text', 'hashtags']);
  var msg = removeHashTag(tweetFields.text);
  var msgClean = utils.cleanSpaces(msg);
  
  console.log('msgClean', msgClean);
  if ( msgClean === 'help' || !msgClean.length ) {
    var post = tweetBuilder.createHelpMsg(tweetFields.screen_name);
    postTweet(post);
    return;
  }

  findScheduleAndPost(msg, tweetFields.screen_name);
    
}

function listenStream(hashtag) {
  var stream = T.stream('statuses/filter', { track: hashtag});
  stream.on('tweet',handleNewTweet);
}

function postTweet(message) {
  T.post('statuses/update', {status: message},
    function(err, data, response) {
      if (err) return console.log(err);
      console.log('posted', message);
    }
  )
}

// var mongoose = require('mongoose');
// var config = require('../config');

// mongoose.connect(config.mongoConnection);

// findScheduleAndPost('larcomar Terminator ', 'ggwp')

module.exports.listenStream = listenStream;