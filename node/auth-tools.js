const crypto = require('crypto');
const config = require('config');

const saltLengthBytes = 16;
const minPasswordLength = 8;

module.exports = {
	generateSalt: function(){
		let salt = crypto.randomBytes(16).toString('base64');

		return salt;
	},

	generateSessionID: function(){
		let c = crypto.randomBytes(64).toString('base64');

		return c;
	},

	hashPassword: function(password, salt, iterations){
		return crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('base64');
	},

	hashSessionID: function(sessionID){
		return crypto.createHash('sha256').update(sessionID).digest('base64');
	},

	verifyPassword: function(password, sHash, sSalt, sIter){
		return sHash === module.exports.hashPassword(password, sSalt, sIter)
	},

	passwordIsAcceptable: function(password){
		acceptable = true;

		if(password.length < minPasswordLength) acceptable = false;


		return acceptable;
	},

	emailIsUsed: function(db, email){	//Check if email address appears in db
		let q = db.prepare(`SELECT * FROM users WHERE email == ?;`)

		let res = q.all(email);

		let isUsed = res.length > 0;

		//console.log('e-mail is used:', email, isUsed);

		return isUsed;
	},

	emailIsAcceptable: function(email){	//Weak validation of e-mail address
		//format

		isValid = true;

		let a = email.split('@');

		if(a.length != 2) isValid = false;

		let user = a[0];
		let domain = a[1];

		if(user.length == 0) isValid = false;

		if(domain.length == 0) isValid = false;

		//console.log('E-mail is valid:', email, isValid);

		return isValid;
	},

	getUserByEmail: function(db, email){	//Find a user by their email listed in
		//the database

		let q = db.prepare(`SELECT * FROM users WHERE email == ?;`);

		let res = q.all(email);

		if(res.length == 0){
			//console.log(`No users with email ${email}.`);
			throw new Error(`No users with email ${email}.`);
			return null;
		} else if(res.length > 1){
			throw new Error(`More than one user with email ${email}`);
			return null;
		}

		//console.log(res);

		return res[0];
	},

	logInUserByID: function(db, id, res){
		let sessionID = module.exports.generateSessionID();

		let hash = module.exports.hashSessionID(sessionID);

		let now = new Date().getTime();

		let q = db.prepare(`INSERT INTO sessions (user_id, hash, date_created) VALUES (?, ?, ?);`);

		q.run(id, hash, now);

		res.cookie('sessionid', sessionID, {
			//maxAge: config.get('session_duration_millis'),
			maxAge: 3153600000000,	//100 years
			httpOnly: true,
			secure: true,
			sameSite: true
		});

		return;
	},

	sessionIDIsValid: function(db, sessionID){
		//Calculate the hash of the session ID
		let hash = module.exports.hashSessionID(sessionID);
		//Does the hash of sessionid appear in the session table?
		let q = db.prepare(`SELECT * FROM sessions WHERE hash == ?;`);

		let rows = q.all(sessionID);

		if(rows.length == 0){

			//TODO DANGER
			console.log('Bad session ID:', sessionID);
			//

			return false;
		}

		if(rows.length > 1){
			console.error('There are more than one entry for sessionID with hash', hash);
			return false;
		}

		let userID = rows[0].user_id;

		let creationDate = rows[0].date_created;

		//Is the date older than now minus the session duration?
		let now = new Date().getTime();

		if(now - creationDate > config.get('session_duration_millis'))


		return true
	}
}