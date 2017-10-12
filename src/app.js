'use strict'

const log = require('./lib/log')
const queueFactory = require('./lib/queue-factory')
const twitterProcessor = require('./lib/twitter-processor')

const incomingQueueProcessor = async (incomingPayload, twitterProcessor, outgoingQueue) => {
  log.info({ payload: incomingPayload }, 'Processing incoming payload')

  // JSON.parse the payload so we can access the JSON properties
  incomingPayload = JSON.parse(incomingPayload.content.toString())

  // Retrieve data from the Twitter API
  let outgoingPayload = await twitterProcessor.pull(incomingPayload.twitterScreenName)

  // Stringify the payload for putting onto a queue. Then put onto the queue.
  outgoingPayload = JSON.stringify(outgoingPayload)
  outgoingQueue.sendToQueue(outgoingQueue, outgoingPayload)
}

const start = async (messageBroker, incomingQueueName, outgoingQueueName) => {
  log.info({
    incomingQueueName: incomingQueueName,
    outgoingQueueName: outgoingQueueName
  }, 'Creating queues and injecting queue processor')

  const incomingQueue = await queueFactory.create(messageBroker, incomingQueueName)
  const outgoingQueue = await queueFactory.create(messageBroker, outgoingQueueName)
  incomingQueue.consume(incomingQueueProcessor, twitterProcessor, outgoingQueue)
}

module.exports = {
  start
}
