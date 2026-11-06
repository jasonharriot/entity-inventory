module.exports = function(req, res){
	const safeID = Number(req.params.tagid);
		
	if(isNaN(safeID)){
		console.error(`Bad tag ID: ${id}`);
		res.writeHead(400);
		res.end();
		return;
	}

	//console.log('Card info request:', safeID);

	const card = req.db.getCardByTagID(safeID);

	if(card){
		res.send(card);
	} else{
		res.writeHead(400);
		res.end();
	}
}