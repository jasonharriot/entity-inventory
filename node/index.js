const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const config = require('config');
const database = new DatabaseSync(config.get('db_file_path'));
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const port = config.get('port');

const registrationHandler = require('./user-register-handler');
const loginHandler = require('./login-handler.js');
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

app.use((req, res, next) => {	//Middleware to dump everything to console. 
	console.log(`[${new Date().toISOString()}] ${req.url}`);

	req.sqlite = database;	//Add the database as a property of req, so it can
	//be accessed by other middle-ware.

	next();
});

app.use('/', express.static('html'));	//For requests to the root, just serve
//static files.

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/api/register', registrationHandler);

app.post('/api/login', loginHandler);

app.post('/api/pwchange', passwordChangeHandler);

app.get('/api/get-id-counter', getIDCounterHandler);

app.get('/api/template/list', templateListHandler);

app.get('/s/:tagid', scanHandler);

app.get('/api/card/list', cardListHandler)

app.get('/api/card/read/:tagid', cardReadHandler);

app.get('/api/card/family/:tagid', cardFamilyHandler);

app.get('/api/card/extended-family/:tagid', cardExtendedFamilyHandler);

app.get('/api/card/write/:tagid', cardWriteHandler);

app.get('/api/backup/sqlite', backupSQLiteHandler);

app.use('/api/search', searchHandler);

app.get('/api/sheet/generate/:templatePartial/:numPages', sheetGenerateHandler);

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
		password_hash_iter INTEGER NOT NULL
	);`);

	database.exec(`CREATE TABLE IF NOT EXISTS sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
		user_id INTEGER NOT NULL,
		hash TEXT NOT NULL,
		date_created INTEGER NOT NULL
	);`);

	let q = database.prepare(`SELECT datetime('now')`);

	let test = q.all();

	console.log(test[0]);

	console.log(`Server running on port ${port}`);
});