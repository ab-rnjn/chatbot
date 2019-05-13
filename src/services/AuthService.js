const { getDB } = require('../Utility/mongoClient');
const Reply = require('../Utility/Reply');
const Mongo = require('mongodb');

class AuthenticationService {

    static async newUser(req, res) {
        const db = getDB();
        const reply = new Reply();
        const emailCheck = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var { username, password, name, email } = req.body;
        if (!req.body || !email || !password || !username || !emailCheck.test(email)) {
            reply.error.push('Invalid data');
            return res.send(JSON.stringify(reply));
        }
        email = email.toLowerCase()
        const user = await db.collection('Users').findOne({ $or: [{ Username: username }, { Email: email }] });
        if (!user) {
            await db.collection('Users').save({ Username: username, Email: email, Password: password, Name: name });
            reply.info = 'User Registered Successfully';
            return res.send(JSON.stringify(reply));
        }
        if (user.Email === email) {
            reply.error = 'Email Already Exists';
            return res.send(JSON.stringify(reply));
        }
        reply.error = 'Username Already Taken';
        return res.send(JSON.stringify(reply));
    }

    static async checkUsername() {
        const db = getDB();
        const reply = new Reply();
        const { username } = req.body;
        const user = await db.collection('Users').findOne({ Username: username });
        if (user) {
            reply.error = 'Username Already Taken';
            return res.send(JSON.stringify(reply));
        }
        reply.info = 'Username Available';
        return res.send(JSON.stringify(reply));
    }

    static async login(){
        const db = getDB();
        const reply = new Reply();
        var { username, password} = req.body;
        if (!req.body || !password || !username) {
            reply.error.push('Invalid data');
            return res.send(JSON.stringify(reply));
        }
        const user =  await db.collection('Users').findOne({ Username: username , Password: password });
        if(!user){
            reply.error.push('User does not exist with given username password combination');
            return res.send(JSON.stringify(reply));
        }
        reply.data =  {name: user.Name, email: user.Email, username: user.Username };
        reply.info = jwt.sign({username: user.Username, id: user._id.toString()}, config.secretKey);
        return res.send(JSON.stringify(reply));
    }

}

module.exports = AuthenticationService; 