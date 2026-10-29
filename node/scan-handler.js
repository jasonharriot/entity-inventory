const { updateCardOnScan } = require('./update-card-on-scan.js');
const config = require('config');

module.exports = function(req, res){
	let tagID = req.params.tagid;

	if(!req.app.locals.authenticatedUser){
		console.log('No user logged in');

		//let redirURL = req.url;

		//res.redirect(`../login?fwd=${encodeURIComponent(redirURL)}`);

		let msg = 'Please login before doing that.'

		res.redirect(`../login?msg=${encodeURIComponent(msg)}`);
		return;
	}

	if(isNaN(tagID) || tagID <= 0 || tagID > config.get('maximum_tag_id')){	//Max id is 999999. 
		console.error(`Bad tag ID: ${tagID}`);
		console.error(e);
		res.writeHead(400);
		res.end();
		return;
	}

	console.log('Tag scan event:', tagID);

	updateCardOnScan(req.sqlite, tagID);	//Update the date_scanned fields

	res.redirect(`../view-card?tagid=${tagID}`);
}