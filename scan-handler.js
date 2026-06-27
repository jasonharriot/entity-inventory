const { updateCardOnScan } = require('./update-card-on-scan.js');

module.exports = function(req, res){
	let tagID = req.params.tagid;

	if(isNaN(tagID) || tagID <= 0 || tagID > 999999){	//Max id is 999999. 
		console.error(`Bad tag ID: ${tagID}`);
		console.error(e);
		res.writeHead(400);
		res.end();
		return;
	}

	console.log('Tag scan event:', tagID);

	updateCardOnScan(req.sqlite, tagID);	//Update the date_scanned fields

	res.redirect(`../view-card.html?tagid=${tagID}`);
}