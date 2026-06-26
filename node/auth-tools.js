const crypto = require('crypto');
const config = require('config');

const saltLengthBytes = 16;
const minPasswordLength = 8;
const passwordHashIterations = 10000;

const sessionIDBytes = 64;
const sessionIDHashAlgo = 'sha512';

const passwordHashBytes = 64;
const passwordHashAlgo = 'sha512';

module.exports = {
	generateSalt: function(){
		let salt = crypto.randomBytes(saltLengthBytes).toString('base64');

		return salt;
	},

	generateSessionID: function(){
		let c = crypto.randomBytes(sessionIDBytes).toString('base64');

		return c;
	},

	hashPassword: function(password, salt, iterations){
		return crypto.pbkdf2Sync(password, salt, iterations, passwordHashBytes, passwordHashAlgo).toString('base64');
	},

	hashSessionID: function(sessionID){
		return crypto.createHash(sessionIDHashAlgo).update(sessionID).digest('base64');
	},

	verifyPassword: function(password, sHash, sSalt, sIter){
		return sHash === module.exports.hashPassword(password, sSalt, sIter)
	},

	passwordIsAcceptable: function(password){
		acceptable = true;

		if(password.length < minPasswordLength) acceptable = false;


		return acceptable;
	},

	generatePasswordInfo: function(password){
		let salt = module.exports.generateSalt();

		let hash = module.exports.hashPassword(password, salt, passwordHashIterations);

		return {
			hash: hash,
			salt: salt,
			iterations: passwordHashIterations
		}
	},

	createUser: function(db, email, password){
		let passInfo = module.exports.generatePasswordInfo(password);

		let q = db.prepare(`INSERT INTO users (email, password_hash, password_salt, password_hash_iter) VALUES (?, ?, ?, ?)`);
		q.run(email, passInfo.hash, passInfo.salt, passInfo.iterations);

		console.log('Created user:', email);
	},

	changePassword: function(db, id, pw){
		let newPassInfo = module.exports.generatePasswordInfo(pw);

		let q = db.prepare(`UPDATE users SET password_hash = ?, password_salt = ?, password_hash_iter = ? WHERE id == ?;`);

		q.run(newPassInfo.hash, newPassInfo.salt, newPassInfo.iterations, id);

		console.log('Updated password for:', id);
	},

	emailIsUsed: function(db, email){	//Check if email address appears in db
		let q = db.prepare(`SELECT * FROM users WHERE email == ?;`)

		let res = q.all(email);

		let isUsed = res.length > 0;

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

		return isValid;
	},

	getUserByEmail: function(db, email){	//Find a user by their email listed in
		//the database

		let q = db.prepare(`SELECT * FROM users WHERE email == ?;`);

		let res = q.get(email);

		if(!res){
			//console.log(`No users with email ${email}.`);
			return null;

		}

		return res;
	},

	getUserByID: function(db, id){
		let q = db.prepare(`SELECT * FROM users WHERE id == ?;`);

		let res = q.get(id);

		if(!res){
			return null;
		}

		return res;
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

	deleteSessionByID: function(db, id){	//Delete a session by the database
		//entry id (not session id)

		let q = db.prepare(`DELETE FROM sessions WHERE id == ?;`);
		q.run(id);
	},

	deleteSessionBySessionID: function(db, sessionID){
		let validSession = module.exports.getValidSessionBySessionID(db, sessionID);

		if(!validSession){	//If the session was deleted because it was invalid,
			//or if the session does not exist, then don't do anything.
			return;
		}

		module.exports.deleteSessionByID(db, validSession.id);
	},

	getValidSessionBySessionID: function(db, sessionID){
		//Calculate the hash of the session ID
		let hash = module.exports.hashSessionID(sessionID);
		//Does the hash of sessionid appear in the session table?
		let q = db.prepare(`SELECT * FROM sessions WHERE hash == ?;`);

		let session = q.get(hash);

		if(!session){
			return null;
		}

		let creationDate = session.date_created;

		//Is the date older than now minus the session duration?
		let now = new Date().getTime();

		if(now - creationDate > config.get('session_duration_millis')){
			module.exports.deleteSessionByID(db, session.id);
			return null;
		}

		return session
	},

	getUserBySessionID: function(db, sessionID){
		let session = module.exports.getValidSessionBySessionID(db, sessionID);

		if(!session){
			return null;
		}

		let user = module.exports.getUserByID(db, session.user_id);

		if(!user){
			return null;
		}

		return user;
	},

	authMiddleware: function(req, res, next){
		req.app.locals['authenticatedUser'] = null;	//TODO: Is this smart or dumb?

		let sessionID = req.cookies['sessionid'];

		if(!sessionID){
			//Don't insert user data into req.
			return next();
		}

		let user = module.exports.getUserBySessionID(req.sqlite, sessionID);

		if(!user){
			return next();
		}

		req.app.locals['authenticatedUser'] = user;

		console.log('User is currently logged in:', user.email);

		next();
	}
}