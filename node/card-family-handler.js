const { getCardByTagID } = require('./get-card-by-tag-id.js');
const { getSiblingIDs } = require('./get-sibling-ids.js');
const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');

module.exports = function(req, res){
	const safeID = Number(req.params.tagid);
		
	if(isNaN(safeID)){
		console.error(`Bad tag ID: ${id}`);
		res.writeHead(400);
		res.end();
		return;
	}

	console.log('Card family request:', safeID);

	const card = getCardByTagID(req.sqlite, safeID);

	const siblingIDs = getSiblingIDs(req.sqlite, safeID, card.synth_parent_ids);

	const childIDs = getChildIDsByTagID(req.sqlite, safeID);

	const family = {
		'sibling_ids': siblingIDs,
		'child_ids': childIDs
	}

	console.log(family);

	res.send(family);
}