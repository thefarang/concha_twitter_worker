'use strict'

const queueFactory = require('./lib/queue-factory')
const twitterProcessor = require('./lib/twitter-processor')

const incomingQueueProcessor = async (incomingPayload, twitterProcessor, outgoingQueue) => {
  // JSON.parse the payload so we can access the JSON properties
  incomingPayload = JSON.parse(incomingPayload.content.toString())

  // Retrieve data from the Twitter API
  let outgoingPayload = await twitterProcessor.pull(incomingPayload.twitterScreenName)

  // Stringify the payload for putting onto a queue. Then put onto the queue.
  outgoingPayload = JSON.stringify(outgoingPayload)
  outgoingQueue.sendToQueue(outgoingQueue, outgoingPayload)
}

const start = async (messageBroker, incomingQueueName, outgoingQueueName) => {
  const incomingQueue = await queueFactory.create(messageBroker, incomingQueueName)
  const outgoingQueue = await queueFactory.create(messageBroker, outgoingQueueName)
  incomingQueue.consume(incomingQueueProcessor, twitterProcessor, outgoingQueue)
}

module.exports = {
  start
}
