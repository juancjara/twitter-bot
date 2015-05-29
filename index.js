var twitterHandler = require('./tweet/tweetHandler');
var config = require('./config');

twitterHandler.listenStream(config.hashtag);

console.log('twitter bot listening');

//var lis = $('.sidebar-box:first ul:first li a').toArray().map(function(el){return $(el).text().replace(/ /g,""); });
