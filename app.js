let sqlite3 = require('sqlite3');
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let path = require('path');
let url = require('url');
let pug = require('pug');

let db = new sqlite3.Database('db/database.db');

let app = express();

const PORT = 3000;

// sets pug as the default engine for website
app.set('view engine', 'pug');

// sets the folder for pugs templates
app.set("views", path.join(__dirname, "views"));


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

function checkExpiration(key, callback) {
	db.get('SELECT * FROM accounts WHERE key = \'' + key + '\' ;', function (err, results) {

		if (results.expire <= Math.round((new Date()).getTime() / 1000)) {
			return callback(true);
		} else {
			return callback(false);
		}
	});
}

// Generates a random string to be used as a key
function generateKey() {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < 32; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

// Sets the randomly generated key to the users key in the db
function setUserKey(username) {

	db.run('UPDATE accounts SET key = ? WHERE username = ?', [generateKey(), username], function (err) {
		if (err) {
			return console.error(err.message);
		}
	});
}

// Sets the key expiration for the user to one month in the future in the database
function setKeyExpiration(username) {

	let expiration = Math.round((new Date()).getTime() / 1000) + 2592000;

	db.run('UPDATE accounts SET expire = ? WHERE username = ?', [expiration, username], function (err) {
		if (err) {
			return console.error(err.message);
		}
	});
}

// runs when a user successfully logs in
function successfulLogin(username) {
	setUserKey(username);
	setKeyExpiration(username);
}

// renders the login page
app.get('/', function (req, res) {

	res.render("login", {
		ip: req.query.ip
	});

});

// runs when a user tries to login
app.post('/auth', function (req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let ip = req.body.ip;

	if (username && password) {
		db.get('SELECT * FROM accounts WHERE username = \'' + username + '\' AND password = \'' + password + '\';', function (err, results) {
			if (err)
				console.log(err);
			if (results) {
				successfulLogin(username);
				db.get('SELECT * FROM accounts WHERE username = \'' + username + '\' ;', function (err, results) {
					res.redirect(url.format({
						pathname: ip,
						query: {
							key: results.key
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

app.get('/api/v1/tutorials/:key', (req, res) => {
			db.get('SELECT * FROM accounts WHERE key = \'' + req.params.key + '\' ;', function (err, results) {
					if (results) {
						checkExpiration(req.params.key, function (expired) {
							if (!expired) {
								db.all('SELECT * FROM tutorials WHERE userid = \'' + results.id + '\' ;', function (err, results) {
									res.send(results)
								});
							} else {
								res.send({error: "invalid or expired key"});
							}
						});
					}else{
						res.send({error: "invalid or expired key"});
					}});
			});

app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`)
});