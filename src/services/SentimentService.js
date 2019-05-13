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

// var textapi = new AylienTextAPI({
//   application_id: config.aylien_app_id,
//   application_key: config.aylien_app_key
// });
// textapi.sentiment({
//   'text': 'Cats are not amazing.'
// }, function (error, response) {
//   if (error === null) {
//     console.log('alyien', response);
//   }
//   // console.log('error', error);
// });

class SentimentService {
  notify(socket, data) {

  }

  static async fetchMessages(req, res) {
    const db = getDB();
    const reply = new Reply();
    const user_alpha = jwt.decode(req.get('authorization')).id //check it;
    const user_beta = req.params.user;
    const messageList = await db.collection('Users').find({ $or: [{ from: user_alpha, to: user_beta }, { from: user_beta, to: user_alpha }] }).sort({ time: 1 });
    reply.data = messageList;
    return res.send(JSON.stringify(reply));
  }

  static async sendMessage(socket, data) {
    const db = getDB();
    let token = socket.handshake.headers['Authorization'];

    const alpha_user = jwt.decode(token).id;    // extract header from data verify returns alpha id
    const sentiment = await new Promise((resolve, reject) => {
      textapi.sentiment({
        'text': data.message
      }, function (error, response) {
        if (error === null) {
          console.log('alyien', response);
          resolve(response.polarity); // return emoji
        }
        reject(error);
      });
    });
    data.sentiment = sentiment;
    io.sockets.in(alpha_user).emit('message', { beta_user: data.beta, message: data.message, sentiment });
    await db.collection('Messages').save({ from: alpha, to: beta, message: data.message, sentiment, time: new Date() });
    return
  }

  static async fetchUsers(req, res) {
    const db = getDB();
    const reply = new Reply();
    const userList = db.collection('Users').find({}, { password: 0 }).toArray();
    reply.data = userList;
    return res.send(JSON.stringify(reply));
  }

}

module.exports = SentimentService;