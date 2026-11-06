module.exports = function(req, res){
	const safeID = Number(req.params.tagid);
		
	if(isNaN(safeID)){
		console.error(`Bad tag ID: ${id}`);
		res.writeHead(400);
		res.end();
		return;
	}

	//console.log('Card family request:', safeID);

	const card = req.db.getCardByTagID(safeID);

	const siblingIDs = req.db.getSiblingIDs(safeID, card.synth_parent_ids);

	const childIDs = req.db.getChildIDsByTagID(safeID);

	const family = {
		'sibling_ids': siblingIDs,
		'child_ids': childIDs
	}

	//console.log(family);

	res.send(family);
}