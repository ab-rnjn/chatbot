const express = require('express');
const app = express();
const Cors = require('Cors')
const { connectToServer } = require('./Utility/mongoClient');
const bodyParser = require('body-parser');
const AuthService = require('./services/AuthService');
const SentimentService = require('./services/SentimentService');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

// app.use(function (req, res, next) {
//     if (!req.headers.authorization) {
//         return res.status(403).json({ error: 'Permission Denied' });
//     }
//     try {
//         const token = req.get('authorization');
//         jwt.verify(token, config.secretKey);
//     } catch (err) {
//         console.log(err);
//         return res.status(403).json({ error: 'Permission Denied' });
//     }
//     next();
// });

//================================================ Services =============================================================

app.post('/login', AuthService.login);
app.get('/checkUsername/:name', AuthService.checkUsername);
app.post('/newUser', AuthService.newUser);
app.get('/fetchMessages/:user', SentimentService.fetchMessages);
app.get('/fetchUsers', SentimentService.fetchUsers);

const server = app.listen(2000, () => {
    connectToServer((db) => {
        console.log('App is listening on 2000');
    });
})

const io = require('socket.io').listen(server, {
    log: false,
    agent: false,
    origins: '*:*',
    transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});

// io.use((socket, next) => {
//     console.log('inuse');
//     let token = socket.handshake.headers['Authorization'];
//     console.log("token",token);
//     if (!token) {
//         return next(new Error('authentication error'));
//     }
//     try {
//         jwt.verify(token, config.secretKey);
//     } catch (err) {
//         console.log(err);
//         return next(new Error('authentication error'));    }
//     next();

// });

io.on('connection', function (socket) {
    console.log('a user connected');
    console.log('<<<<<<<<<< ' ,socket.rooms)
    socket.on('message', (data) => {
        if (!data.token) {
            return socket.disconnect('unauthorized');
        }
        let decode;
        try {
            decode = jwt.verify(data.token, config.secretKey);
        } catch (err) {
            console.log(err);
            return socket.disconnect('unauthorized');
        }
        data.token = decode;
        SentimentService.sendMessage(io, data);
        // io.sockets.in(data.beta).emit('message', data);

    });
    socket.on('connect-user', function (data) {
        if (!data.token) {
            return socket.disconnect('unauthorized');
        }
        let decode;
        try {
            decode = jwt.verify(data.token, config.secretKey);
        } catch (err) {
            console.log(err);
            return socket.disconnect('unauthorized');
        }
        
        socket.join(decode.id); // We are using room of socket io
        socket.broadcast.emit('connect-user', decode.id);
        SentimentService.changeStatus(decode.id, true);


        // console.log('toka', decode);
    });
    socket.on('disconnect-user', function (data) {
        if (!data.token) {
            return socket.disconnect('unauthorized');
        }
        let decode;
        try {
            decode = jwt.verify(data.token, config.secretKey);
        } catch (err) {
            console.log(err);
            return socket.disconnect('unauthorized');
        }
        socket.leave(decode.id);
        socket.broadcast.emit('disconnect-user', decode.id);
        SentimentService.changeStatus(decode.id, false);

        console.log('user left ', decode.id);
    });
    // let token = socket.handshake.headers['Authorization'];
    // console.log('toke', token);
    // let data = jwt.decode(token);
    // socket.join(data.username); 

});
