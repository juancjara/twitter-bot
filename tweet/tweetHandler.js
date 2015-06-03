var Twit = require('twit');
var models = require('../models');
var utils = require('../helpers/utils');
var config = require('../config');
var format = require('string-template');
var match = require('../helpers/match')

var T = new Twit(config.twitter);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/twitterbot');

function findNextIndexFit(arr, spaceAvailable) {
  var spaceUsed = arr[0].length;
  var index = 1;
  while (index < arr.length) {
    //+1 because of space
    newSpace = arr[index].length + 1;
    if (spaceUsed + newSpace > spaceAvailable) break;
    spaceUsed += newSpace;
    index++;
  }
  return index;
}

function shouldUseOneTweet(max, length) {
  return getAvailableSpace(max, length) > 0
}

function getSpaceWithoutMsg(max, fields, template) {
  fields.msg = '';
  return getAvailableSpace(max, format(template, fields).length);
}

function getAvailableSpace(max, length) {
  return max - length;
}

function generateLongTweets(maxSpace, fields) {
    var tweets = [];
    var times = fields.msg.split(' ');
    var firstTweetTemplate = '@{to} movie:{movie} theater:{theater} -> {msg} ' +
                             '({count}) {uniqueField}';

    var spaceAvailable = getSpaceWithoutMsg(maxSpace, fields, firstTweetTemplate);
    var last = findNextIndexFit(times, spaceAvailable);
    fields.msg = times.slice(0, last).join(' ');
    tweets.push(format(firstTweetTemplate, fields));

    var initial;
    var nextTweetsTemplate = '@{to} {msg} ({count}) {uniqueField}';
    spaceAvailable = getSpaceWithoutMsg(maxSpace, fields, nextTweetsTemplate);
    
    while(last < times.length) {
      fields.count++;
      initial = last;
      last += findNextIndexFit(times.slice(initial), spaceAvailable);
      fields.msg = times.slice(initial, last).join(' ');
      tweets.push(format(nextTweetsTemplate, fields));
    }

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

  var oneTweetTemplate = '@{to} movie:{movie} theater:{theater} -> {msg} {uniqueField}';
  var oneTweet = format(oneTweetTemplate, fields);

  if (shouldUseOneTweet(maxSpace, oneTweet.length)) {
    tweets.push(oneTweet);
  } else {
    tweets = generateLongTweets(maxSpace, fields);
  }
  return tweets;
}

function handleNewTweet(tweet) {
  console.log('------------------on tweet --------------------------');
  var tweetFields = parseFieldsFromTweet(tweet, ['id', 'name', 'screen_name', 'text', 'hashtags']);
  var msg = tweetFields.text.replace(/#\w+/i, '');

  match.parseQueryFromTweet(msg)
    .then(models.schedule.getOne)
    .then(function(data) { 
      if(!data.schedule) {
        data.schedule = 'No schedule found';
      };
      var posts = createPosts(tweetFields.screen_name, data);
      posts.map(function(post) {
        postTweet(post);
      })
    });
}

function listenStream(hashtag) {
  var stream = T.stream('statuses/filter', { track: hashtag});
  stream.on('tweet',handleNewTweet);
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

function postTweet(message) {
  console.log('post', message); return;
  T.post('statuses/update', {status: message},
    function(err, data, response) {
      if (err) return console.log(err);
      console.log('posted', message);
    }
  )
}

function queryTweet(text) {
  var queryFields = match.parseQueryFromTweet(text);
  return models.schedule.getOne(queryFields);
}

/*
gg('boterino', {
  movie: 'ggwp',
  theater: 'lol',
  schedule: 'ASDF as as as a a sa a sa a as as a a s ASDF as as as a a sa a sa a as as a a s FFFF as as as a a sa a sa a as as a a s ASDF as as as a a sa 123sa a as as a a s ASDF as as as a a sa a sa a as as a a s ASDF as as as a a sa a sa a as as a a s'
})
*/

handleNewTweet({ created_at: 'Thu May 28 20:52:28 +0000 2015',
  id: 604027482900152300,
  id_str: '604027482900152320',
  text: '#ggwp123 mad max amc empire',
  source: '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>',
  truncated: false,
  in_reply_to_status_id: null,
  in_reply_to_status_id_str: null,
  in_reply_to_user_id: null,
  in_reply_to_user_id_str: null,
  in_reply_to_screen_name: null,
  user: 
   { id: 3252772133,
     id_str: '3252772133',
     name: 'boterino',
     screen_name: 'boterino123',
     location: '',
     url: null,
     description: null,
     protected: false,
     verified: false,
     followers_count: 0,
     friends_count: 41,
     listed_count: 0,
     favourites_count: 0,
     statuses_count: 28,
     created_at: 'Wed May 13 21:45:26 +0000 2015',
     utc_offset: null,
     time_zone: null,
     geo_enabled: false,
     lang: 'en',
     contributors_enabled: false,
     is_translator: false,
     profile_background_color: 'C0DEED',
     profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
     profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
     profile_background_tile: false,
     profile_link_color: '0084B4',
     profile_sidebar_border_color: 'C0DEED',
     profile_sidebar_fill_color: 'DDEEF6',
     profile_text_color: '333333',
     profile_use_background_image: true,
     profile_image_url: 'http://abs.twimg.com/sticky/default_profile_images/default_profile_2_normal.png',
     profile_image_url_https: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_2_normal.png',
     default_profile: true,
     default_profile_image: true,
     following: null,
     follow_request_sent: null,
     notifications: null },
  geo: null,
  coordinates: null,
  place: null,
  contributors: null,
  retweet_count: 0,
  favorite_count: 0,
  entities: 
   { hashtags: [ [Object] ],
     trends: [],
     urls: [],
     user_mentions: [],
     symbols: [] },
  favorited: false,
  retweeted: false,
  possibly_sensitive: false,
  filter_level: 'low',
  lang: 'en',
  timestamp_ms: '1432846348868' })

module.exports = {
  listenStream: listenStream
}