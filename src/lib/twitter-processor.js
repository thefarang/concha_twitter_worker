'use strict'

const log = require('./log')
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
    log.info({ twitterScreenName: twitterScreenName }, 'Pulling Twitter data for user')
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

    const twitterData = {
      twitterScreenName: twitterScreenName,
      noOfFollowers: twitterUser.followers_count,
      noOfTweets: twitterUser.statuses_count, // No of tweets
      noOfLikesReceived: favoriteCount, // No of tweet likes
      noOfRetweetsReceived: retweetCount
    }

    log.info({ twitterData: twitterData }, 'Twitter data pulled and processed successfully')
    return twitterData
  } catch (err) {
    // @todo - what to do here in the event of failure
    log.info({ err: err }, 'An error occurred pulling data from Twitter')
  }
}

const getUser = (screenName) => {
  return new Promise((resolve, reject) => {
    twitter.getUser({
      screen_name: screenName
    },
    (err, res, body) => {
      log.info({ err: err, screenName: screenName }, 'An error occurred getting the Twitter user')
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
      log.info({
        err: err,
        screenName: screenName
      }, 'An error occurred getting the latest tweets for Twitter user')
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
