'use strict'

const config = require('config')
const expect = require('chai').expect

const testMb = require('../support/mb')
const app = require('../../app')

const twitterScreenName = 'concha_app'

const messageBroker = config.get('messageBroker')
const incomingQueueName = config.get('incomingQueue')
const outgoingQueueName = config.get('outgoingQueue')
let channel = null

/* eslint-disable no-unused-expressions */
/* eslint-disable handle-callback-err */
describe('Twitter Worker', () => {
  before(async () => {
    // Start the app
    await app.start(messageBroker, incomingQueueName, outgoingQueueName)

    // Gain access to the queues
    const conn = await testMb.connect(messageBroker)
    channel = await testMb.createChannel(conn)
    await testMb.assertQueue(channel, incomingQueueName)
    await testMb.assertQueue(channel, outgoingQueueName)

    await testMb.cleanQueue(channel)
  })

  it('Should correctly pull Twitter data from the Twitter API and publish it to the twitter_recieve queue', (done) => {
    // First create a payload and publish an update to the message broker.
    const payload = JSON.stringify({ twitterScreenName: twitterScreenName })
    channel.sendToQueue(incomingQueueName, Buffer.from(payload, 'UTF-8'), { persistent: false })

    // Wait a couple of seconds to allow the message to be picked up off
    // the queue and processed, then check the twitter_receive
    setTimeout(() => {
      channel.consume(outgoingQueueName, async (msg) => {
        const incomingPayload = JSON.parse(msg.content.toString())
        expect(incomingPayload.twitterScreenName).to.equal(twitterScreenName)
        expect(incomingPayload.noOfFollowers).to.equal(1)
        expect(incomingPayload.noOfTweets).to.equal(3)
        expect(incomingPayload.noOfLikesReceived).to.equal(2)
        expect(incomingPayload.noOfRetweetsReceived).to.equal(0)
        done()
      }, { noAck: true })
    }, 3000)
  })
})
/* eslint-enable handle-callback-err */
/* eslint-enable no-unused-expressions */
