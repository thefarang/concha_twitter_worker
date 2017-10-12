'use strict'

const bunyan = require('bunyan')

module.exports = bunyan.createLogger({name: 'concha_twitter_worker'})
