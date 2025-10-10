const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const database = new DatabaseSync('db.sqlite');

const port = 8001;

const { getIDCounter } = require('./getIDCounter.js');
const { getEntryByTagID } = require('./getEntryByTagID');
const { SheetManager } = require('./sheetManager.js');
const { updateEntryOnScan } = require('./updateEntryOnScan.js');

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.url}`);

	next();
});

app.use('/', express.static('html'));	//For requests to the root, just serve static.

app.get('/api/getIDCounter', (req, res) => {
	
	let counter = getIDCounter(database);
	res.send(counter);
});

app.get('/s/:tagid', (req, res) => {
	let tagID = req.params.tagid;
	console.log('Tag scan event:', tagID);

	updateEntryOnScan(database, tagID);	//Update the date_scanned fields

	//let entry = getEntryByTagID(database, tagID);

	//res.send(entry);

	res.redirect(`/viewtag.html?tagid=${tagID}`);
});

app.get('/api/card/:tagid', (req, res) => {
	let tagID = req.params.tagid;

	console.log('Card info request:', tagID);

	let entry = getEntryByTagID(database, tagID);

	res.send(entry);
})

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
		parent_ids TEXT DEFAULT '',
		container_volume_L REAL DEFAULT NULL,
		contents TEXT DEFAULT '',
		form TEXT DEFAULT '',
		mass_initial_kg REAL DEFAULT NULL,
		date_sample TEXT DEFAULT '', 
		date_experiment TEXT DEFAULT '',
		date_issued TEXT DEFAULT CURRENT_TIMESTAMP,
		date_scanned_first TEXT DEFAULT '',
		date_scanned_latest TEXT DEFAULT '',
		notes TEXT DEFAULT '',
		status TEXT DEFAULT ''
		);`);

	console.log(`Server running on port ${port}`);
});