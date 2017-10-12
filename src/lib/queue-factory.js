'use strict'

const amqp = require('amqplib/callback_api')
const Queue = require('./queue')

const connect = (messagebroker) => {
  return new Promise((resolve, reject) => {
    amqp.connect(messagebroker, (err, conn) => {
      if (err) {
        return reject(err)
      }
      return resolve(conn)
    })
  })
}

const createChannel = (conn) => {
  return new Promise((resolve, reject) => {
    conn.createChannel((err, channel) => {
      if (err) {
        return reject(err)
      }
      return resolve(channel)
    })
  })
}

const assertQueue = (channel, q) => {
  return new Promise((resolve, reject) => {
    channel.assertQueue(q, {durable: false}, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve(q)
    })
  })
}

const create = async (messagebroker, queueName) => {
  const conn = await connect(messagebroker)
  const channel = await createChannel(conn)
  await assertQueue(channel, queueName)
  // @todo
  // Configure this
  channel.prefetch(10)
  return new Queue(messagebroker, channel, queueName)
}

module.exports = {
  create
}
