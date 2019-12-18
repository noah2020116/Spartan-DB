const express = require('express'); // Express framework
const app = express();
const request = require('request')
const options = {
  url: 'http://api.github.com/repos/josh-daisey/Spartan-DB',
  method: 'GET',
  headers: { 'User-Agent': 'Mozilla/5.0' }
}

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

app.get("/github", function (req, res) {
	request(options, function(request_err, request_res, request_body) {
        if (request_err || request_res.statusCode != 200) {
            res.send("Oops! There was a problem with the request module: <br>" + request_err);
        } else {
            res.status(200).send(request_body);
        }
    })
});

app.listen(3001, function() {
	console.log('Listening on port ' + 3001 + '.');
});

