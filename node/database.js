const crypto = require('crypto');
const config = require('config');

const { DatabaseSync } = require('node:sqlite');
const PermissionManager = require('./permission-manager');

const { parseIDListString } = require('./parse-id-list-string');

module.exports = class Database{
	constructor(path){
		this.path = path;
		this.dbSync = new DatabaseSync(this.path);

		this.saltLengthBytes = 16;
		this.minPasswordLength = 8;
		this.passwordHashIterations = 10000;

		this.sessionIDBytes = 64;
		this.sessionIDHashAlgo = 'sha512';

		this.passwordHashBytes = 64;
		this.passwordHashAlgo = 'sha512';

		//Set up the tables if they do not already exist
		this.dbSync.exec(`CREATE TABLE IF NOT EXISTS cards (
			id INTEGER PRIMARY KEY AUTOINCREMENT,

			type TEXT DEFAULT '',
			contents TEXT DEFAULT '',
			date_sample TEXT DEFAULT '', 
			mass_initial TEXT DEFAULT '',

			parent_ids TEXT DEFAULT '',
			status TEXT DEFAULT '',

			container_size TEXT DEFAULT '',
			
			form TEXT DEFAULT '',
			
			date_experiment TEXT DEFAULT '',

			date_issued TEXT DEFAULT CURRENT_TIMESTAMP,
			date_scanned_first TEXT DEFAULT '',
			date_scanned_latest TEXT DEFAULT '',
			date_modified_first TEXT DEFAULT '',
			date_modified_latest TEXT DEFAULT '',
			notes TEXT DEFAULT ''
		);`);

		this.dbSync.exec(`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			password_salt TEXT NOT NULL,
			password_hash_iter INTEGER NOT NULL,
			date TEXT NOT NULL
		);`);

		this.dbSync.exec(`CREATE TABLE IF NOT EXISTS sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
			user_id INTEGER NOT NULL,
			hash TEXT NOT NULL,
			date_created INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`);

		this.dbSync.exec(`CREATE TABLE IF NOT EXISTS permissions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			date_granted INTEGER NOT NULL,
			granted_by_id INTEGER,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (granted_by_id) REFERENCES users(id),
			UNIQUE (user_id, name)
		);`);

		this.prepChangePassword = this.dbSync.prepare(`UPDATE users SET password_hash = ?, password_salt = ?, password_hash_iter = ? WHERE id == ?;`);
		this.prepCreateBlankCard = this.dbSync.prepare(`INSERT INTO cards DEFAULT VALUES`);
		this.prepCreateMinimumIDCard = this.dbSync.prepare('INSERT OR IGNORE INTO cards(id) VALUES(?)');
		this.prepCreateSession = this.dbSync.prepare(`INSERT INTO sessions (user_id, hash, date_created) VALUES (?, ?, ?);`);
		this.prepCreateUser = this.dbSync.prepare(`INSERT INTO users (email, password_hash, password_salt, password_hash_iter, date) VALUES (?, ?, ?, ?, ?)`);
		this.prepDeleteSession = this.dbSync.prepare(`DELETE FROM sessions WHERE id == ?;`);
		this.prepGetCardsByID = this.dbSync.prepare('SELECT * FROM cards WHERE id = ?');
		this.prepGetCardsDescending = this.dbSync.prepare('SELECT * FROM cards ORDER BY id DESC LIMIT 1');
		this.prepGetCardsInUse = this.dbSync.prepare(`SELECT * FROM cards WHERE (
			(contents IS NOT NULL AND contents <> '') OR
			(parent_ids IS NOT NULL AND parent_ids <> '') OR
			(type IS NOT NULL AND type <> '') OR
			(date_sample IS NOT NULL AND date_sample <> '')) AND
			((date_modified_first IS NOT NULL AND date_modified_first <> '') OR
			id < 1000)
			`);
		this.prepGetUserByEmail = this.dbSync.prepare(`SELECT * FROM users WHERE email == ?;`);
		this.prepGetUserByID = this.dbSync.prepare(`SELECT * FROM users WHERE id == ?;`);
		this.prepGetUsers = this.dbSync.prepare('SELECT * FROM users');
		this.prepGrantPermission = this.dbSync.prepare('INSERT OR IGNORE INTO permissions (user_id, name, date_granted, granted_by_id) VALUES (?, ?, ?, ?)');
		this.prepRevokePermission = this.dbSync.prepare('DELETE FROM permissions WHERE user_id == ? AND name == ?');
		this.prepSelectEmail = this.dbSync.prepare(`SELECT * FROM users WHERE email == ?;`);
		this.prepUpdateModifiedDate = this.dbSync.prepare(`UPDATE cards SET date_modified_first =
			case when ifnull(date_modified_first, '') is '' then ? else
			date_modified_first end, date_modified_latest = ? WHERE id = ?`);
		this.prepUpdateScanDate = this.dbSync.prepare(`UPDATE cards SET date_scanned_first =
			case when ifnull(date_scanned_first, '') is '' then ? else
			date_scanned_first end, date_scanned_latest = ? WHERE id = ?`);
		this.prepGetSessionByHash = this.dbSync.prepare(`SELECT * FROM sessions WHERE hash == ?;`);
		this.prepGetPermissions = this.dbSync.prepare(`SELECT * FROM permissions WHERE user_id == ?`);
	}




	//Auth methods
	generateSalt(){
		return crypto.randomBytes(this.saltLengthBytes).toString('base64');
	}

	generateSessionID(){
		return crypto.randomBytes(this.sessionIDBytes).toString('base64');
	}

	hashPassword(password, salt, iterations){
		return crypto.pbkdf2Sync(password, salt, iterations, this.passwordHashBytes, this.passwordHashAlgo).toString('base64');
	}

	hashSessionID(sessionID){
		return crypto.createHash(this.sessionIDHashAlgo).update(sessionID).digest('base64');
	}

	passwordIsValid(password, sHash, sSalt, sIter){
		return sHash === this.hashPassword(password, sSalt, sIter)
	}

	passwordIsAcceptable(password){
		if(password.length < this.minPasswordLength){
			return false;
		}

		return true;
	}

	generatePasswordInfo(password){
		let salt = this.generateSalt();

		let hash = this.hashPassword(password, salt, this.passwordHashIterations);

		return {
			hash: hash,
			salt: salt,
			iterations: this.passwordHashIterations
		}
	}




	//User management methods
	createUser(email, password){
		let passInfo = this.generatePasswordInfo(password);

		let now = new Date().getTime();

		this.prepCreateUser.run(email, passInfo.hash, passInfo.salt, passInfo.iterations, now);

		console.log('Created user:', email);
	}

	changePassword(id, pw){
		let newPassInfo = this.generatePasswordInfo(pw);

		this.prepChangePassword.run(newPassInfo.hash, newPassInfo.salt, newPassInfo.iterations, id);

		console.log('Updated password for:', id);
	}

	grantPermission(user_id, perm, granting_user_id){
		let now = new Date().getTime();

		this.prepGrantPermission.run(user_id, perm, now, granting_user_id);
	}

	revokePermission(user_id, perm){
		this.prepRevokePermission.run(user_id, perm);
	}

	logInUserByID(id, res){
		let sessionID = this.generateSessionID();

		let hash = this.hashSessionID(sessionID);

		let now = new Date().getTime();

		this.prepCreateSession.run(id, hash, now);

		res.cookie('sessionid', sessionID, {
			maxAge: config.get('session_duration_millis'),
			httpOnly: true,
			secure: true,
			sameSite: true
		});

		return;
	}

	deleteSessionByID(id){	//Delete a session by the database
		//entry id (not session id)

		this.prepDeleteSession.run(id);
	}

	deleteSessionBySessionID(sessionID){
		let validSession = this.getValidSessionBySessionID(sessionID);

		if(!validSession){	//If the session was deleted because it was invalid,
			//or if the session does not exist, then don't do anything.
			return;
		}

		this.deleteSessionByID(validSession.id);
	}




	//User query methods

	emailIsUsed(email){	//Check if email address appears in db
		let res = this.prepSelectEmail.all(email);

		let isUsed = res.length > 0;

		return isUsed;
	}

	emailIsAcceptable(email){	//Weak validation of e-mail address
		//format

		let a = email.split('@');

		if(a.length != 2) return false;

		let user = a[0];
		let domain = a[1];

		if(user.length == 0) return false;

		if(domain.length == 0) return false;

		return true;
	}

	getPermissionsByUserID(id){
		let res = this.prepGetPermissions.all(id);

		let permissions = new PermissionManager();

		for (let row of res){
			permissions.grant({
				name: row['name'],
				dateGranted: row['date_granted'],
				grantedByID: row['granted_by_id'],
				implied: false
			});
		}

		return permissions
	}

	getUserByEmail(email){	//Find a user by their email listed in
		//the database

		let res = this.prepGetUserByEmail.get(email);

		if(!res){
			//console.log(`No users with email ${email}.`);
			return null;

		}

		return res;
	}

	getUserByID(id){
		let res = this.prepGetUserByID.get(id);

		if(!res){
			return null;
		}

		res['permissions'] = this.getPermissionsByUserID(id);

		return res;
	}

	getValidSessionBySessionID(sessionID){
		//Calculate the hash of the session ID
		let hash = this.hashSessionID(sessionID);
		//Does the hash of sessionid appear in the session table?

		let session = this.prepGetSessionByHash.get(hash);

		if(!session){
			return null;
		}

		let creationDate = session.date_created;

		//Is the date older than now minus the session duration?
		let now = new Date().getTime();

		if(now - creationDate > config.get('session_duration_millis')){
			this.deleteSessionByID(session.id);
			return null;
		}

		return session
	}

	getUserBySessionID(sessionID){
		let session = this.getValidSessionBySessionID(sessionID);

		if(!session){
			return null;
		}

		let user = this.getUserByID(session.user_id);

		if(!user){
			return null;
		}

		return user;
	}

	getUsers(){
		const users = this.prepGetUsers.all();

		users.forEach((user, i) => {
			user.permissions = this.getPermissionsByUserID(user.id);
		});

		return users;
	}









	//Authentication middleware
	//Insert the authenticatedUser value into req.app.locals for EJS and other
	//parts of the program to use
	authMiddleware = (req, res, next) => {	//TODO Does this need to be an arrow function? Scope of this.xxx changes when not.
		req.app.locals['authenticatedUser'] = null;

		let sessionID = req.cookies['sessionid'];

		if(!sessionID){
			//Don't insert user data into req.
			return next();
		}

		let user = this.getUserBySessionID(sessionID);

		if(!user){
			return next();
		}

		req.app.locals['authenticatedUser'] = user;

		console.log('User:', user.email);

		next();
	}




	//Card query methods

	getExtendedFamilyIDs(baseID){
		let discoveredIDs = [];

		let thisDB = this;

		let discover = (thisID) => {
			//console.log(`Checking ${thisID}`);
			if(discoveredIDs.indexOf(thisID) >= 0){
				//console.log(`Skipped ${thisID}`);
				return;
			}

			discoveredIDs = discoveredIDs.concat(thisID);
			//console.log(`Discovered: ${thisID}. Total: `
			//	+ `${discoveredIDs.length}`);

			const card = this.getCardByTagID(thisID);
			//console.log(card.synth_parent_ids);
			if(card) card.synth_parent_ids.forEach(discover);

			const childIDs = this.getChildIDsByTagID(thisID);
			//console.log(childIDs);
			childIDs.forEach(discover);
		}

		discover(baseID);	//Recursive search

		//console.log(`Extended family: ${discoveredIDs.length} entities`);

		return discoveredIDs;
	}

	getChildIDsByTagID(tagID){	//Get a list of card IDs for
		//cards who have the specified card (tagID) as a parent.

		const cards = this.getCards();	//All cards which have some info
		//filled out.	TODO: Only query cards which have tagID as a parent

		const childCards = cards.filter((card) => {
			const parentIDs = parseIDListString(card.parent_ids);

			return parentIDs.includes(tagID);
		});

		if(childCards.length == 0){
			//console.log(`No child cards exist for ${tagID}`);
			return [];
		}

		const childIDs = [];

		childCards.forEach((card) => {
			childIDs.push(card.id);
		});

		return childIDs;
	}

	getSiblingIDs(cardID, parentIDs){
		//console.log(`Fetching siblings for ${cardID}. Parents: ${parentIDs}`);
		//console.log(`Fetching siblings for ${cardID}. Parents: ${parentIDs}`
		//	+ `, children: ${childIDs}`);

		let siblingIDs = [];

		parentIDs.forEach((parentID) => {
			let childIDs = this.getChildIDsByTagID(parentID);

			//siblingIDs = siblingIDs.concat(childIDs);

			childIDs.forEach((childID) => {
				if(siblingIDs.indexOf(childID) == -1 && childID != cardID){
					siblingIDs = siblingIDs.concat(childID);
					//console.log(`Added: ${childID}`)
				} else{
					//console.log(`Not a valid sibling: ${childID}`);
				}
			})
		});

		return siblingIDs;
	}

	getCardByTagID(id){
		const cards = this.prepGetCardsByID.all(id);	//Insert the ID value into the
		//query, and execute it.

		if(cards.length > 1){
			throw new Error(`More than one card is not acceptable!`);
		}

		if(cards.length == 0){
			//console.log(`No cards for ${id}.`);
			return null;
		}

		const card = cards[0];

		const parentIDs = parseIDListString(card.parent_ids);

		card['synth_parent_ids'] = parentIDs; //We already have the parent IDs,
		//so just parse it to a list and insert it here.

		return card;
	}

	getCards(){
		const cards = this.prepGetCardsInUse.all();

		return cards;
	}

	searchCards(searchQueryString){
		const fieldsGroup1 = [
			'id',
			'type',
			'contents',
			'date_sample',
			'mass_initial',
			'parent_ids',
			'status',
			'container_size',
			'form',
			'date_experiment',
			'notes'
		];

		const parameters = {}
		
		const fieldOps = [];

		fieldsGroup1.forEach((field) => {
			const fieldOp = `${field} LIKE \$${field}`;	//Use the field name as a
			//named parameter, i.e. "foo LIKE $placeholder_called_foo"

			fieldOps.push(fieldOp);

			parameters[field] = `%${searchQueryString}%`;	//Percent sign indicates wildcard of
			//any number of characters
			
		});

		//Custom-build this query because it has many fields
		const query = this.dbSync.prepare(`SELECT * FROM cards WHERE (${fieldOps.join(` OR `)})`);
		const results = query.all(parameters);

		//console.log(`Query yielded ${results.length} cards.`);

		return results;
	}





	//Card management methods
	issueIDs(num){
		let idList = [];

		const minimumTagID = config.get('minimum_tag_id');	//Start all tags from this number up. Do not
		//issue any cards with tag IDs below this number.

		let i=0;

		const minimumEntry = this.getCardByTagID(minimumTagID)

		if(minimumEntry == null){
			//console.log(`Adding minimum-id entry with id=${minimumTagID}`)

			this.prepCreateMinimumIDCard.run(minimumTagID);

			let lastID = this.getIDCounter();	//Should be equal to 
			//minimumTagID.

			idList.push(lastID);

			i++;
		}

		for(;i<num; i++){
			this.prepCreateBlankCard.run();	//All values
			//will take on default state.

			let lastID = this.getIDCounter();	//The ID of the entry we
			//insert comes from the autoincrement behavior of the ID field. We
			//never ask for a specific ID.

			idList.push(lastID);
		}

		return idList;
	}

	updateFields(id, data){
		let safeID = Number(id);
		
		if(isNaN(safeID)){	//TODO: is sanitization needed here if prepared 
			//statements are used?

			console.error(`Bad tag ID: ${id}`);
			return;
		}

		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		//This is the current date in time in UCT (!!!). Remove the fractional
		//seconds and replace the T with a space.

		//Update the date_modified_first field if it is null or empty (''), 
		//otherwise set it to its current value (make no change). Also, set
		//date_modified_latest to the current date in all cases.

		const result = this.prepUpdateModifiedDate.run(now, now, id);	//Insert the ID value into the
		//query, and execute it.

		for(let [field, value] of data){	//TODO: This is bad practice, do not
			//allow partial writes

			let query = this.dbSync.prepare(`UPDATE cards SET ${field}=? WHERE id=?`);
			const result = query.run(value, safeID);
			//console.log(result);
		}
	}

	updateCardOnScan(id){
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		//This is the current date in time in UCT (!!!). Remove the fractional
		//seconds and replace the T with a space.

		const result = this.prepUpdateScanDate.run(now, now, id);	//Insert the ID value into the
		//query, and execute it.
	}




	//Other query methods
	getIDCounter(){
		let counter = 0;

		let res = this.prepGetCardsDescending.all();

		if(res.length == 0){
			//console.log('There are no rows. Assuming counter at zero.');
		} else{
			const lastRow = res[0];
			counter = lastRow.id;
		}

		return counter;
	}
}