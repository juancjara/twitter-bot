var twitterLogic = require('./tweet/logic');
var config = require('./config');

twitterLogic.listenStream(config.hashtag);

console.log('twitter bot listening');

//var lis = $('.sidebar-box:first ul:first li a').toArray().map(function(el){return $(el).text().replace(/ /g,""); });
