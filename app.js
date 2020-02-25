let sqlite3 = require('sqlite3');
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let path = require('path');
let url = require('url');
let pug = require('pug');

let db = new sqlite3.Database('db/database.db');

let app = express();
 
// sets pug as the default engine for website
app.set('view engine', 'pug')

// sets the folder for pugs templates
app.set("views", path.join(__dirname, "views"));


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

function generateKey() {
	let result           = '';
	let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < 32; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }

 function setUserKey(username){

	db.run('UPDATE accounts SET key = ? WHERE username = ?', [generateKey(), username], function(err) {
	if (err) {
		return console.error(err.message);
		}
	});
}

app.get('/', function(req, res) {
	
	res.render("login", {ip: req.query.ip});

});

app.post('/auth', function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let ip = req.body.ip;

	if (username && password) {
		db.get('SELECT * FROM accounts WHERE username = \'' + username + '\' AND password = \'' + password + '\';', function(err, results) {
			if (err)
				console.log(err);
			if (results) {
				setUserKey(username)
				db.get('SELECT * FROM accounts WHERE username = \'' + username + '\' ;', function(err, results){
					res.redirect(url.format({
					pathname: ip,
					query: {
						key: results['key']
					}
					
				}));
				res.end();
				});
				
			} else {
				res.send('Incorrect Username and/or Password!');
				res.end();
			}
				
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.listen(3000);

console.log("Server starting on port 3000")
