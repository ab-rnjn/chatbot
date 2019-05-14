const config = require('../config');
const { getDB } = require('../Utility/mongoClient');
const Reply = require('../Utility/Reply');
const Mongo = require('mongodb');
const Sentiment = require('sentiment');
const AylienTextAPI = require('aylien_textapi');
const jwt = require('jsonwebtoken');

var sentiment = new Sentiment();
// var result = sentiment.analyze("Cats are not amazing.");
// console.log('sentiment', result);

const textapi = new AylienTextAPI({
  application_id: config.aylien_app_id,
  application_key: config.aylien_app_key
});
// textapi.sentiment({
//   'text': 'Cats are not amazing.'
// }, function (error, response) {
//   if (error === null) {
//     console.log('alyien', response);
//   }
//  console.log('error', error);
// });

class SentimentService {
  notify(socket, data) {

  }

  static async fetchMessages(req, res) {
    if (!req.headers.authorization) {
      return res.status(403).json({ error: 'Permission Denied' });
    }
    try {
      const token = req.get('authorization');
      jwt.verify(token, config.secretKey);
    } catch (err) {
      console.log(err);
      return res.status(403).json({ error: 'Permission Denied' });
    }
    const db = getDB();
    const reply = new Reply();
    const user_alpha = jwt.decode(req.get('authorization')).id //check it;
    const user_beta = req.params.user;
    // console.log(user_alpha,user_beta);
    const messageList = await db.collection('Messages').find({ $or: [{ from: user_alpha, to: user_beta }, { from: user_beta, to: user_alpha }] }, { projection: { _id: 0 } }).
      sort({ time: 1 }).toArray();
    // console.log(messageList);
    reply.data = messageList;
    return res.send(JSON.stringify(reply));
  }

  static async sendMessage(io, data) {
    const db = getDB();
    const alpha_user = data.token.id;    // extract header from data verify returns alpha id
    const sentiment = await new Promise((resolve, reject) => {
      textapi.sentiment({
        'text': data.message
      }, function (error, response) {
        if (error === null) {
          // console.log('alyien', response);
          resolve(response.polarity); // return emoji
        }
        reject(error);
      });
    });
    const sentiment_map = { positive: ':)', negative: ':(', neutral: ':|' }
    data.sentiment = sentiment_map[sentiment];
    io.sockets.in(data.beta).emit('message', { beta_user: data.beta, message: data.message, sentiment: data.sentiment, alpha_user: alpha_user });
    await db.collection('Messages').save({ from: alpha_user, to: data.beta, message: data.message, sentiment: data.sentiment, time: new Date() });
    return
  }

  static async fetchUsers(req, res) {
    if (!req.headers.authorization) {
      return res.status(403).json({ error: 'Permission Denied' });
    }
    let id;
    try {
      const token = req.get('authorization');
      id = jwt.verify(token, config.secretKey).id;
    } catch (err) {
      console.log(err);
      return res.status(403).json({ error: 'Permission Denied' });
    }
    const db = getDB();
    const reply = new Reply();
    const userList = await db.collection('Users').find({ _id: { $ne: new Mongo.ObjectID(id) } }, { projection: { Password: 0 } }).toArray();
    reply.data = userList;
    return res.send(JSON.stringify(reply));
  }

}

module.exports = SentimentService;