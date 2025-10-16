const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const database = new DatabaseSync('db.sqlite');
const fs = require('fs');

const port = 8001;

const { getIDCounter } = require('./get-id-counter.js');
const { getCardByTagID } = require('./get-card-by-tag-id');
const { SheetManager } = require('./sheet-manager.js');
const { updateCardOnScan } = require('./update-card-on-scan.js');
const { updateFields } = require('./update-fields.js');

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.url}`);

	next();
});

app.use('/', express.static('html'));	//For requests to the root, just serve
//static files.

app.get('/api/get-id-counter', (req, res) => {
	let counter = getIDCounter(database);
	res.send(counter);
});

app.get('/api/template/list', (req, res) => {
	fs.readdir('templates', (err, files) => {
		if(err){
			console.error(err);

			res.writeHead(500);
			res.end();
			return;
		}
		let validTemplates = [];	//contains partial filenames for which a
		//pdf file and a sidecar file exist.

		files.forEach( (file) => {
			const prefix = 'template_';	//Template files must start with this,
			//and this will be truncated from the template name.

			const suffix = '.pdf';	//Template files must end with this, and 
			//this will be truncated from the template name.

			if(file.startsWith(prefix) && file.endsWith(suffix)){
				let partial = file.slice(prefix.length,
					file.length - suffix.length);

				console.log(partial);

				const sidecarExists = fs.existsSync(`templates/template_ \
					${partial}.json`);

				if(sidecarExists){
					validTemplates.push(partial);
				}
			}
		});

		console.log(`Found valid templates: ${validTemplates}`)

		res.end(JSON.stringify(validTemplates));
	});


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

	updateCardOnScan(database, tagID);	//Update the date_scanned fields

	//let card = getCardByTagID(database, tagID);

	//res.send(card);

	res.redirect(`../view-card.html?tagid=${tagID}`);
});

app.get('/api/card/list', (req, res) => {
	const q = database.prepare(`SELECT * FROM cards WHERE
		((contents IS NOT NULL AND contents <> '') OR
		(type IS NOT NULL AND type <> '') OR
		(date_sample IS NOT NULL AND date_sample <> '')) AND
		((date_modified_first IS NOT NULL AND date_modified_first <> '') OR
		id < 1000)
		`);

	const rows = q.all();

	res.send(rows);
	res.end();
})

app.get('/api/card/read/:tagid', (req, res) => {
	let tagID = req.params.tagid;

	console.log('Card info request:', tagID);

	let card = getCardByTagID(database, tagID);

	res.send(card);
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
			console.log(`Client attempted to write to illegal field \
				${queryField}.`);
			res.send(`Field is not writable: ${queryField}`);
			res.writeHead(400);
			res.end();
			return;
		}
	}

	updateFields(database, tagID, data);

	res.redirect(`../../../view-card.html?tagid=${tagID}`);
});

app.get('/api/backup/sqlite', (req, res) => {	//Send the whole database file.

	const timestamp = new Date().toISOString().slice(0, 19)
		.replace('T', '_'.replace(':', '-'));

	const filename = `db_${timestamp}.sqlite`;

	console.log(`Sending database file: ${filename}`);

	res.download('db.sqlite', filename, (err) => {
		if(err){
			console.error('There was an error sending the database file.');
			console.error(err);
		} else{
			console.log('Success!');
		}
	});
})

app.get('/api/sheet/generate/:templatePartial/:numPages', (req, res) => {
	/*if(!('templatePartial' in req.params) || !('numPages' in req.params)){
		res.writeHead(400);
		res.end();

		console.error('Missing param values in this call.');
		console.error(req.params);
		return;
	}*/

	const numPages = req.params.numPages;
	const templatePartial = req.params.templatePartial;

	const templateSidecarPath = `templates/template_${templatePartial}.json`;

	if(!fs.existsSync(templateSidecarPath)){
		console.error(`JSON file ${templateSidecarPath} does not exist or cannot
			be opened.`);
		res.writeHead(400);
		res.end();

		return;
	}

	const templateJSON = JSON.parse(fs.readFileSync(templateSidecarPath));

	let s = new SheetManager(templateJSON);

	console.log('Making document...');

	let prom = s.makeDocument(database, numPages);	//makeDocument will return
	//a PDF object (from pdf-lib, see the respective documentation).

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