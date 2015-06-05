var format = require('string-template');

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

function generateLongTweets(maxSpace, fields) {
  var tweets = [];
  var times = fields.msg.split(' ');
  var firstTweetTemplate = '@{to} movie:{movie} theater:{theater} -> {msg} ' +
                           '({count}) {uniqueField}';

  var spaceAvailable = getSpaceWithoutMsg(maxSpace, fields, 
                                          firstTweetTemplate);
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

function shouldUseOneTweet(max, tweetSize) {
  return tweetSize < max;
}

function getSpaceWithoutMsg(max, fields, template) {
  fields.msg = '';
  return max - format(template, fields).length;
}

module.exports = function createPosts(to, queryInfo) {
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

  if (shouldUseOneTweet(maxSpace, oneTweet.length)) {
    tweets.push(oneTweet);
  } else {
    tweets = generateLongTweets(maxSpace, fields);
  }
  return tweets;
}