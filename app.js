const express = require('express'); // Express framework
const app = express();

let session = require('express-session');
// Set up session with express
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
let path = require('path');

const sqlite3 = require('sqlite3'); // Interfaces with sqlite3 database
// const db = new sqlite3.Database('database/JSFdatabase.db');

const bodyParser = require('body-parser'); // Parses data from http request bodies
//S et up bodyParser with express
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

//Set up web folders
app.use(express.static("public"));

app.listen(3001, function() {
	console.log('Listening on port ' + 3001 + '.');
});

