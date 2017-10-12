'use strict'

const log = require('./log')
const config = require('config')
const amqp = require('amqplib/callback_api')
const Queue = require('./queue')

const connect = (messageBroker) => {
  return new Promise((resolve, reject) => {
    log.info({ messageBroker: messageBroker }, 'Connecting to messagebroker')
    amqp.connect(messageBroker, (err, conn) => {
      if (err) {
        log.info({
          err: err,
          messageBroker: messageBroker
        }, 'Error occurred whilst connecting to message broker')
        return reject(err)
      }
      return resolve(conn)
    })
  })
}

const createChannel = (conn) => {
  return new Promise((resolve, reject) => {
    log.info({}, 'Creating channel')
    conn.createChannel((err, channel) => {
      if (err) {
        log.info({ err: err }, 'Error occurred whilst creating a channel')
        return reject(err)
      }
      return resolve(channel)
    })
  })
}

const assertQueue = (channel, queueName) => {
  return new Promise((resolve, reject) => {
    log.info({ queueName: queueName }, 'Asserting queue')
    channel.assertQueue(queueName, {durable: false}, (err) => {
      if (err) {
        log.info({
          err: err,
          queueName: queueName
        }, 'Error occurred whilst creating a channel')
        return reject(err)
      }
      return resolve(queueName)
    })
  })
}

const create = async (messagebroker, queueName) => {
  const conn = await connect(messagebroker)
  const channel = await createChannel(conn)
  await assertQueue(channel, queueName)
  channel.prefetch(config.get('channelPrefetch'))
  return new Queue(messagebroker, channel, queueName)
}

module.exports = {
  create
}
