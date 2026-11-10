const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');

const registrationHandler = require('./user-register-handler');
const loginHandler = require('./login-handler.js');
const logoutHandler = require('./logout-handler.js');
const passwordChangeHandler = require('./password-change-handler.js');
const templateListHandler = require('./template-list-handler.js');
const scanHandler = require('./scan-handler.js');
const cardListHandler = require('./card-list-handler.js');
const cardReadHandler = require('./card-read-handler.js');
const cardFamilyHandler = require('./card-family-handler.js');
const cardExtendedFamilyHandler = require('./card-extended-family-handler.js');
const cardWriteHandler = require('./card-write-handler.js');
const backupSQLiteHandler = require('./backup-sqlite-handler.js');
const sheetGenerateHandler = require('./sheet-generate-handler.js');
const searchHandler = require('./search-handler.js');
const permissionChecker = require('./permission-checker.js')
const permissionGrantHandler = require('./permission-grant-handler.js');
const permissionRevokeHandler = require('./permission-revoke-handler.js');

const Database = require('./database.js');

const port = config.get('port');

const db = new Database(config.get('db_file_path'));

const app = express();

app.use((req, res, next) => {	//Middleware to dump everything to console. 
	console.log(`[${new Date().toISOString()}] ${req.url}`);

	req.db = db;	//Insert the database object

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

app.use(db.authMiddleware);	//The database object provides a middleware that handles checking user authentication

app.post('/api/user/register', registrationHandler);

app.post('/api/user/login', loginHandler);

app.post('/api/user/logout', logoutHandler);

app.post('/api/user/pwchange', passwordChangeHandler);

app.post('/api/user/permission/grant', permissionGrantHandler);

app.post('/api/user/permission/revoke', permissionRevokeHandler);

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
	res.render('index.ejs', {query: req.query});
});

app.get('/bulk-landing', permissionChecker('write'), (req, res) => {
	res.render('bulk-landing.ejs');
});

app.get('/bulk-scan', permissionChecker('write'), (req, res) => {
	res.render('bulk-scan.ejs');
});

app.get('/card-list', permissionChecker('read'), (req, res) => {
	res.render('card-list.ejs');
});

app.get('/chart', permissionChecker('read'), (req, res) => {
	res.render('chart.ejs');
});

app.get('/debug', permissionChecker('officer'), (req, res) => {
	res.render('debug.ejs')
});

app.get('/edit-card', permissionChecker('write'), (req, res) => {
	res.render('edit-card.ejs');
});

app.get('/go-to-card', permissionChecker('read'), (req, res) => {
	res.render('go-to-card.ejs');
});

app.get('/issue', permissionChecker('issue_ids'), (req, res) => {
	res.render('issue.ejs');
});

app.get('/login', (req, res) => {
	if(app.locals.authenticatedUser){
		res.redirect('user');
		return;
	}

	res.render('login.ejs', {query: req.query});
});

app.get('/pwchange', (req, res) => {
	if(!app.locals.authenticatedUser){
		res.redirect('login');
		return
	}

	res.render('pwchange.ejs');
});

app.get('/register', (req, res) => {
	if(app.locals.authenticatedUser){
		res.redirect('/');
		return;
	}

	res.render('register.ejs', {query: req.query});
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
	res.render('user-list.ejs', {users: db.getUsers()});
});

app.get('/user-manage', permissionChecker('officer'), (req, res) => {
	res.render('user-manage.ejs', {query: req.query, user: db.getUserByID(req.query.id)})
})

app.get('/view-card', permissionChecker('read'), (req, res) => {
	res.render('view-card.ejs');
});

app.get('/url-message-test', permissionChecker('officer'), (req, res) => {
	res.render('url-message-test.ejs', {query: req.query});
});




//Server start
app.listen(port);