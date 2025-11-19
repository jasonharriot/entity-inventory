const { getExtendedFamilyIDs } = require('./get-extended-family-ids.js');
const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');

module.exports = function(req, res){
	const safeID = Number(req.params.tagid);
		
	if(isNaN(safeID)){
		console.error(`Bad tag ID: ${id}`);
		res.writeHead(400);
		res.end();
		return;
	}

	console.log('Card extended family request:', safeID);

	const ids = getExtendedFamilyIDs(req.sqlite, safeID);

	res.send(ids);
}