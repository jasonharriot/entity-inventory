const fs = require('fs');
const { SheetManager } = require('./sheet-manager.js');

module.exports = function(req, res){
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

	let prom = s.makeDocument(req.sqlite, numPages);	//makeDocument will return
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
}