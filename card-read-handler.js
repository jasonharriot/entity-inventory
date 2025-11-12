const { getCardByTagID } = require('./get-card-by-tag-id.js');

module.exports = function(req, res){
	let tagID = req.params.tagid;

	console.log('Card info request:', tagID);

	let card = getCardByTagID(req.sqlite, tagID);

	if(card){
		res.send(card);
	} else{
		res.writeHead(400);
		res.end();
	}
}