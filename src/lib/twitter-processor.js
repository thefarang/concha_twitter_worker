'use strict'

const config = require('config')
const Twitter = require('twitter-node-client').Twitter

const twitter = new Twitter({
  'consumerKey': config.get('consumerKey'),
  'consumerSecret': config.get('consumerSecret'),
  'accessToken': config.get('accessToken'),
  'accessTokenSecret': config.get('accessTokenSecret'),
  'callBackUrl': config.get('twitterCallbackUrl')
})

const pull = async (twitterScreenName) => {
  try {
    const twitterUser = await getUser(twitterScreenName)
    const tweets = await getLatestTweets(twitterScreenName)

    let favoriteCount = 0
    let retweetCount = 0
    if (tweets.length > 0) {
      tweets.forEach(tweet => {
        favoriteCount += tweet.favorite_count
        retweetCount += tweet.retweet_count
      })
    }

    return {
      twitterScreenName: twitterScreenName,
      noOfFollowers: twitterUser.followers_count,
      noOfTweets: twitterUser.statuses_count, // No of tweets
      noOfLikesReceived: favoriteCount, // No of tweet likesz
      noOfRetweetsReceived: retweetCount
    }
  } catch (err) {
    console.log(err)
  }
}

const getUser = (screenName) => {
  return new Promise((resolve, reject) => {
    twitter.getUser({
      screen_name: screenName
    },
    (err, res, body) => {
      return reject(err)
    },
    (twitterUser) => {
      return resolve(JSON.parse(twitterUser))
    })
  })
}

const getLatestTweets = (screenName) => {
  return new Promise((resolve, reject) => {
    twitter.getUserTimeline({
      screen_name: screenName,
      count: config.get('maxNoOfTweets'),
      include_rts: false,
      exclude_replies: true
    },
    (err, res, body) => {
      return reject(err)
    },
    (tweets) => {
      return resolve(JSON.parse(tweets))
    })
  })
}

module.exports = {
  pull
}
