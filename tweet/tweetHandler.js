var Q = require('q');
var Twit = require('twit');

var cinema = require('../models/theater');
var schedule = require('../models/schedule');
var models = require('../models');
var utils = require('../helpers/utils');
var config = require('../config');
var match = require('../helpers/match')
var tweetBuilder = require('./tweetBuilder');

var T = new Twit(config.twitter);

var removeHashTag = function(text) {
  return text.replace(/#\w+/i, '');
};

var removeUser = function(text) {
  return text.replace(/@\w/i, '')
};

var parseFieldsFromTweet = function(tweet, fields) {
  var parsed = {};
  var mapFields = {
    user_id: 'user.id',
    id: 'id',
    name: 'user.name',
    screen_name: 'user.screen_name',
    text: 'text',
    hashtags: 'entities.hashtags'
  };

  fields.forEach(function(k) {
    if (k in mapFields) {
      parsed[k] = utils.getField(tweet, mapFields[k], 'none '+k);
    }
  })

  return parsed;
};

var getLocation = function(id) {
  console.log(getLocation);
  return Q.promise(function (resolve, reject) {
    T.get('statuses/show/:id', {id: id}, function (err, data, response) {
      console.log(err, id);
      console.log(data);
    });
  });
};

var findScheduleAndPost = function(msg, screen_name) {

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
};

var follow = function(id, cb) {
  T.post('friendships/create', {user_id: id, follow: true},
    function(err, data, response) {
      if (err) return cb('follow ' + err);
      cb(null);
    }
  )
};

var handleNewTweet = function(tweet) {

  var tweetFields = parseFieldsFromTweet(tweet,
                     ['id','user_id', 'name', 'screen_name', 'text', 'hashtags']);
  var msg = tweetFields.text;
  if (msg.indexOf('boterino123') < 0 && msg.indexOf(config.hashtag) < 0) {
    return;
  }
  console.log('------------------on tweet --------------------------');
  followTweetUser(tweetFields.user_id, function(err) {
    if (err) return console.log(err);
    handleMessage(tweetFields);
  });
};

var extractValFromHashtag = function(text, regex) {
  var matches = text.match(regex);
  if (!matches) return '';
  return text.match(regex)[0].replace(/#[a-z] /, '').trim();
};

var extractMovieAndCinema = function(text) {
  return {
    movie: extractValFromHashtag(text, /#m [^#]*/),
    cinema: extractValFromHashtag(text, /#c [^#]*/)
  }
};

var tweetMovieTimes = function(to, timeInfo) {
  var posts = tweetBuilder.createPosts(to, timeInfo);
  posts.forEach(function(post) {
    postTweet(post);
  })
};

var tweetMoviesFromCinema = function(to, cinema) {
  var fields = {
    cinema: cinema.realName,
    movies: cinema.movies
      .map(function(movie) {
        return movie.realName;
      })
      .join(' ,')
  };
  console.log('tweetMoviesFromCinema');
  console.log(fields);
  //var post = tweetBuilder.moviesPost(to, fields)
};

var messages = {
  NOT_FOUND: 'No data found'
};

var chooseResponse = function(to, matches) {
  if (!matches.movie && !matches.theater) {
    postTweet(tweetBuilder.createSimpleMsg(to, message.NOT_FOUND));
  } else if (!matches.movie && matches.theater) {
    cinema
      .getMovies(matches.theater)
      .then(utils.partial(tweetMoviesFromCinema, to));
  } if (matches.movie && matches.theater) {
    schedule.getOne(matches)
      .then(utils.partial(tweetMovieTime, to));
  }
};

var handleMessage = function(tweetFields) {
  var queryFields = extractMovieAndCinema(tweetFields.text);
  match.findMovieTimes(queryFields)
    .then(utils.partial(chooseResponse, tweetFields.screen_name));
};

var listenStream = function(hashtag) {
  var stream = T.stream('statuses/filter', { track: hashtag});
  stream.on('tweet', handleNewTweet);
  T.stream('user').on('tweet', handleNewTweet);
};

var postTweet = function(message) {
  T.post('statuses/update', {status: message},
    function(err, data, response) {
      if (err) return console.log(err);
      console.log('posted', message);
    }
  )
};

var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.mongoConnection);

handleMessage({screen_name: 'ggas', text: '#c asdf 123 awer'});

module.exports = listenStream;
listenStream.listenStream = listenStream;

