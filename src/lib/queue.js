'use strict'

const log = require('./log')

class Queue {
  constructor (messagebroker, channel, queueName) {
    this.messagebroker = messagebroker
    this.channel = channel
    this.queueName = queueName
  }

  getQueueName () {
    return this.queueName
  }

  consume (processor, twitterProcessor, outgoingQueue) {
    this.channel.consume(this.queueName, async (msg) => {
      processor(msg, twitterProcessor, outgoingQueue)
    }, { noAck: true })
  }

  sendToQueue (outgoingQueue, payload) {
    log.info({
      outgoingQueueName: outgoingQueue.getQueueName(),
      payload: payload
    }, 'Sending payload to queue')
    this.channel.sendToQueue(outgoingQueue.getQueueName(), Buffer.from(payload, 'UTF-8'), { persistent: false })
  }
}

module.exports = Queue
