const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const database = new DatabaseSync('db.sqlite');

const port = 8001;

const { getIDCounter } = require('./getIDCounter.js');
const { getEntryByTagID } = require('./getEntryByTagID');
const { SheetManager } = require('./sheetManager.js');
const { updateEntryOnScan } = require('./updateEntryOnScan.js');
const { updateFields } = require('./updateFields.js');

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.url}`);

	next();
});

app.use('/', express.static('html'));	//For requests to the root, just serve static.

app.get('/api/getIDCounter', (req, res) => {
	let counter = getIDCounter(database);
	res.send(counter);
});

app.get('/api/getTemplates', (req, res) => {
	res.writeHead(501);
	res.end();
});

app.get('/s/:tagid', (req, res) => {
	let tagID = req.params.tagid;

	if(isNaN(tagID) || tagID <= 0 || tagID > 999999){	//Max id is 999999. 
		console.error(`Bad tag ID: ${tagID}`);
		console.error(e);
		res.writeHead(400);
		res.end();
		return;
	}

	console.log('Tag scan event:', tagID);

	updateEntryOnScan(database, tagID);	//Update the date_scanned fields

	//let entry = getEntryByTagID(database, tagID);

	//res.send(entry);

	res.redirect(`../viewcard.html?tagid=${tagID}`);
});

app.get('/api/card/read/:tagid', (req, res) => {
	let tagID = req.params.tagid;

	console.log('Card info request:', tagID);

	let entry = getEntryByTagID(database, tagID);

	res.send(entry);
});

app.get('/api/card/write/:tagid', (req, res) => {
	let tagID = req.params.tagid;

	let query = req.query;

	const editableFields = [
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

	const data = Object.entries(query);

	for(let [queryField, queryValue] of data){	//Check if 
		//allowed to update field and (TODO) validate input

		console.log(`Write: ${queryField}: "${queryValue}"`);

		if(editableFields.includes(queryField)){
			//console.log('Can edit.');

		} else{
			console.log(`Client attempted to write to illegal field ${queryField}.`);
			res.send(`Field is not writable: ${queryField}`);
			res.writeHead(400);
			res.end();
			return;
		}
	}

	updateFields(database, tagID, data);

	res.redirect(`../../../viewcard.html?tagid=${tagID}`);
});

/*app.get('/api/test/issue', (req, res) => {	//Should never call this, because
	//those IDs will be immediately orphaned with no way to generate labels
	//for them.

	let num = 1;

	if('num' in req.query){
		num = Math.min(1000, Math.max(1, req.query.num));
	}

	console.log(`Number of IDs to issue: ${num}`);

	//Num shall be 1 or more, and less than some large N.

	let idList = issueIDs(database, num);

	res.send(idList);
});*/

app.get('/api/sheet', (req, res) => {
	labelOffset = [.196, .5];
	labelSpacing = [2.756, 1];
	labelNum = [3, 10];

	tagOffset = [1.92, .31];	//Position of the QR code from the bottom left of
	//the label.

	let s = new SheetManager('templates/template_1inch.pdf', labelOffset, labelSpacing, labelNum, tagOffset);

	const numPages = 3;

	console.log('Making document...');

	let prom = s.makeDocument(database, numPages);

	prom.then((pdfObj, err) => {
		pdfObj.save().then((b64String) => {
			res.writeHead(200, {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'filename="labels.pdf"',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0'
			});

			res.end(b64String);

			console.log('PDF sheet sent.');
			
		})
	});
})

app.listen(port, () => {
	console.log(`Setting up database...`);

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


	console.log(`Server running on port ${port}`);
});