const express = require('express');
const app = express();
const Cors = require('Cors')
const { connectToServer } = require('./Utility/mongoClient');
const bodyParser = require('body-parser');
const AuthService = require('./services/AuthService');
const ExecutorService = require('./services/ExecutorService');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

app.use(function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'Permission Denied' });
    }
    next();
});

//================================================ Services =============================================================

app.post('/auth', AuthService.login);
app.post('/createRule', ExecutorService.createRules);
app.post('/sendRules', ExecutorService.sendRules);
app.get('/sendCampaign', AuthService.sendCampaign);


const server = app.listen(2000, () => {
    connectToServer((db) => {
        console.log('App is listening on 2000');
    });
})

const io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('message', (m) => {
        console.log('[server](message): %s', JSON.stringify(m));
        // this.io.emit('message', m);
    });
    var hour = 0;
    var quarter = 0;
    ExecutorService.notify(socket, 24);

});
// var express = require('express');
// var app     = express();
// var server  = require('http').createServer(app);
// var io      = require('socket.io').listen(server);
// ...
// server.listen(1234);