const express = require('express');
const app = express();
const Cors = require('Cors')
const { connectToServer } = require('./Utility/mongoClient');
const bodyParser = require('body-parser');
const AuthService = require('./services/AuthService');
const SentimentService = require('./services/SentimentService');
const jwt = require('jsonwebtoken');
const config = require('../config');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

app.use(function (req, res, next) {
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
    next();
});

//================================================ Services =============================================================

app.post('/auth', AuthService.login);
app.post('/createRule', SentimentService.createRules);
app.post('/sendRules', SentimentService.sendRules);
app.get('/sendCampaign', AuthService.sendCampaign);

app.get('/fetchMessages/:user', SentimentService.fetchMessages);
app.get('/fetchUsers', SentimentService.fetchUsers);

const server = app.listen(2000, () => {
    connectToServer((db) => {
        console.log('App is listening on 2000');
    });
})

const io = require('socket.io').listen(server);

io.use((socket, next) => {
    let token = socket.handshake.headers['Authorization'];
    if (!token) {
        return next(new Error('authentication error'));
    }
    try {
        jwt.verify(token, config.secretKey);
    } catch (err) {
        console.log(err);
        return next(new Error('authentication error'));    }
    next();
   
});

io.sockets.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('message', (data) => {
        console.log('[server](message): %s', JSON.stringify(data));
        SentimentService.sendMessage(socket, data, io);
        
    });
    // socket.on('connect-user', function (data) {
    //     socket.join(data.username); // We are using room of socket io
    //     SentimentService.notify(socket, data);
    //   });
    let token = socket.handshake.headers['Authorization'];
    let data = jwt.decode(token);
    socket.join(data.username); 
    // SentimentService.notify(socket, data);


});
// var express = require('express');
// var app     = express();
// var server  = require('http').createServer(app);
// var io      = require('socket.io').listen(server);
// ...
// server.listen(1234);