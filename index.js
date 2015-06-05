var mongoose = require('mongoose');

var twitterHandler = require('./tweet/tweetHandler');
var config = require('./config');

mongoose.connect(config.mongoConnection);
twitterHandler.listenStream(config.hashtag);

console.log('twitter bot listening');
