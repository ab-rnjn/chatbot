const Mongo= require('mongodb');
const config=require('../config');
const dbUrl= config.dbUrl;
const dbName=config.dbName;
let db;

module.exports = {
    connectToServer: async (cb) => {
        const dbRef = await Mongo.MongoClient.connect( dbUrl , {useNewUrlParser: true}).catch(console.error);
        db = dbRef.db(dbName);
        cb(db);
    },
    getDB : ()=> db
};
