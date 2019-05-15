# Backend

Built on node.js

Command to run :  `backend\src> node server.js`

## Fronted

Built on Angular 7

Command to run :  `frontend> ng s`


## Setup

Run `npm i` in both "backend" and "frontend" folder to install required packages.

### Database Used: MongoDB

### Database Name: chatbot

## Collections Name:  Messages ,  Users

`Messages` contain given keys  {_id, from, to, message, sentiment, time} .

`_id` : Primary key or document id given by mongo.

`from`: id of user who sent the message.

`to`: id of user who recieved the message.

`message`: message exchanged by users.

`time`: time at which it is sent.

`Users` contain given keys  { _id, Username, Email, Password, Name, status} .

`_id` : Primary key or document id given by mongo.

`Username`: unique name decided by user.

`Email`: user's email address.

`Password`: user's password.

`status`: show user's online status . (stores boolean)

## Messages and Users collection files are exported in file Messages.json and Users.json in  database folder respectively.
