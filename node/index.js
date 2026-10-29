const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const config = require('config');
const database = new DatabaseSync(config.get('db_file_path'));
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');

const port = config.get('port');

const registrationHandler = require('./user-register-handler');
const loginHandler = require('./login-handler.js');
const logoutHandler = require('./logout-handler.js');
const passwordChangeHandler = require('./password-change-handler.js');
const templateListHandler = require('./template-list-handler.js');
const scanHandler = require('./scan-handler.js');
const getIDCounterHandler = require('./get-id-counter-handler.js');
const cardListHandler = require('./card-list-handler.js');
const cardReadHandler = require('./card-read-handler.js');
const cardFamilyHandler = require('./card-family-handler.js');
const cardExtendedFamilyHandler = require('./card-extended-family-handler.js');
const cardWriteHandler = require('./card-write-handler.js');
const backupSQLiteHandler = require('./backup-sqlite-handler.js');
const sheetGenerateHandler = require('./sheet-generate-handler.js');
const searchHandler = require('./search-handler.js');
const authTools = require('./auth-tools.js');
const permissionChecker = require('./permission-checker.js')

app.use((req, res, next) => {	//Middleware to dump everything to console. 
	console.log(`[${new Date().toISOString()}] ${req.url}`);

	req.sqlite = database;	//Add the database as a property of req, so it can
	//be accessed by other middle-ware.

	return next();
});

app.use('/', express.static('static'));	//For requests to the root, just serve
//static files from the directory.

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.locals = {
	config: config	//So we can use the config.get method in views
}

// app.locals = {
// 	site: {
// 		name: config.get('site_name'),
// 		description: config.get('site_description'),
// 		hostname: config.get('hostname')
// 	}
// }

app.use(authTools.authMiddleware);

app.post('/api/register', registrationHandler);

app.post('/api/login', loginHandler);

app.post('/api/logout', logoutHandler);

app.post('/api/pwchange', passwordChangeHandler);

app.get('/api/get-id-counter', permissionChecker('read'), getIDCounterHandler);

app.get('/api/template/list', permissionChecker('read'), templateListHandler);

app.get('/api/card/list', permissionChecker('read'), cardListHandler)

app.get('/api/card/read/:tagid', permissionChecker('read'), cardReadHandler);

app.get('/api/card/family/:tagid', permissionChecker('read'), cardFamilyHandler);

app.get('/api/card/extended-family/:tagid', permissionChecker('read'), cardExtendedFamilyHandler);

app.get('/api/card/write/:tagid', permissionChecker('write'), cardWriteHandler);

app.get('/api/backup/sqlite', permissionChecker('officer'), backupSQLiteHandler);

app.use('/api/search', permissionChecker('read'), searchHandler);

app.get('/api/sheet/generate/:templatePartial/:numPages', permissionChecker('issue_ids'), sheetGenerateHandler);

//Scan endpoint
app.get('/s/:tagid', scanHandler);

//EJS
app.get('/', (req, res) => {
	res.render('index.ejs');
});

app.get('/bulk-landing', permissionChecker('write'), (req, res) => {
	res.render('bulk-landing.ejs');
});

app.get('/bulk-scan', permissionChecker('write'), (req, res) => {
	res.render('bulk-scan.ejs');
});

app.get('/card-list', permissionChecker('read'), (req, res) => {
	res.render('card-list.ejs');
})

app.get('/chart', permissionChecker('read'), (req, res) => {
	res.render('chart.ejs');
})

app.get('/debug', permissionChecker('officer'), (req, res) => {
	res.render('debug.ejs')
});

app.get('/edit-card', permissionChecker('write'), (req, res) => {
	res.render('edit-card.ejs');
})

app.get('/go-to-card', permissionChecker('read'), (req, res) => {
	res.render('go-to-card.ejs');
})
app.get('/issue', permissionChecker('issue_ids'), (req, res) => {
	res.render('issue.ejs');
});

app.get('/login', (req, res) => {
	if(app.locals.authenticatedUser){
		res.redirect('user');
		return;
	}

	res.render('login.ejs');
})

app.get('/pwchange', (req, res) => {
	if(!app.locals.authenticatedUser){
		res.redirect('login');
		return
	}

	res.render('pwchange.ejs');
});

app.get('/register', (req, res) => {
	if(app.locals.authenticatedUser){
		res.redirect('user');
		return;
	}

	res.render('register.ejs');
});

app.get('/search', permissionChecker('read'), (req, res) => {
	res.render('search.ejs');
});

app.get('/user', (req, res) => {
	if(!app.locals.authenticatedUser){
		res.redirect('login');
		return;
	}

	res.render('user.ejs');
});

app.get('/user-list', permissionChecker('officer'), (req, res) => {
//app.get('/user-list', permissionChecker(), (req, res) => {
	res.render('user-list.ejs');
});

app.get('/view-card', permissionChecker('read'), (req, res) => {
	res.render('view-card.ejs');
})


//Server start
app.listen(port, () => {
	//Create the table if it does not already exist
	database.exec(`CREATE TABLE IF NOT EXISTS cards (
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

	database.exec(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		password_salt TEXT NOT NULL,
		password_hash_iter INTEGER NOT NULL,
		date TEXT NOT NULL
	);`);

	database.exec(`CREATE TABLE IF NOT EXISTS sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
		user_id INTEGER NOT NULL,
		hash TEXT NOT NULL,
		date_created INTEGER NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`);

	database.exec(`CREATE TABLE IF NOT EXISTS permissions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		date_granted INTEGER NOT NULL,
		granted_by_id INTEGER,
		FOREIGN KEY (user_id) REFERENCES users(id),
		FOREIGN KEY (granted_by_id) REFERENCES users(id),
		UNIQUE (user_id, name)
	);`);
});