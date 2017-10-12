'use strict'

const config = require('config')
const app = require('../app')
const log = require('../lib/log')

log.info({}, 'Starting Concha Twitter Worker')

// @todo
// Set timeout to allow time for the message broker to standup.
// Need to improve this solution.
// This issue does not happen in concha_twitter, so why does it
// happen here?
setTimeout(() => {
  app.start(
    config.get('messageBroker'),
    config.get('incomingQueue'),
    config.get('outgoingQueue'))
}, 5000)
