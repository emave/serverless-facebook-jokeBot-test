'use strict';
const axios = require('axios');
const oneLineJoke = require('one-liner-joke');

// When returning Promise - no need to set a callback attribute, and we can use resolve or reject feature,
// It's just a test, so we can set an (event, context, callback) attributes and safely use callback(null, response)
// or callback(err), without Promises, async/await and try/catch blocks
module.exports.webhook = (event) => new Promise(async (res, rej) => {

  if (event.method === 'GET') {
    if (event.query['hub.verify_token'] === process.env.VERIFY_TOKEN && event.query['hub.challenge']) {
      return res(parseInt(event.query['hub.challenge']));
    }
    return rej(new Error('Invalid token'))
  }

  if (event.method === 'POST') {
    const entry = event.body.entry[0];
    const messagingItem = entry.messaging[0];
    if (!(messagingItem.message && messagingItem.message.text)) {
      return rej(new Error('No message'));
    }

    const joke = oneLineJoke.getRandomJoke();
    const url = `https://graph.facebook.com/v3.3/me/messages?access_token=${process.env.ACCESS_TOKEN}`;

    const payload = {
      recipient: {
        id: messagingItem.sender.id
      },
      message: {
        text: joke.body
      }
    };

    try {
      let response = await axios.post(url, payload);
      return res(response);
    }catch (e) {
      return rej(e);
    }
  }
});
