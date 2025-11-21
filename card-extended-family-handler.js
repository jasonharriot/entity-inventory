const { getExtendedFamilyIDs } = require('./get-extended-family-ids.js');
const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');
const { getCardByTagID } = require('./get-card-by-tag-id.js');

module.exports = function(req, res){	//Returns a list of cards. Some entries
	//may be null if the card is not filled or is invalid.

	const safeID = Number(req.params.tagid);
		
	if(isNaN(safeID)){
		console.error(`Bad tag ID: ${id}`);
		res.writeHead(400);
		res.end();
		return;
	}

	console.log('Card extended family request:', safeID);

	const ids = getExtendedFamilyIDs(req.sqlite, safeID);

	let cards = [];

	ids.forEach((id) => {
		const card = getCardByTagID(req.sqlite, id);
		if(!card){	//If this card does not exist, insert a dummy entry that
			//contains only the ID. This behavior is not representative of
			//getCardByTagID, but is needed for creating the relational chart,
			//because even unfilled tags may be part of the network.

			cards.push({
				id: id,
				dummy: true
			})
		} else{
			cards.push(card);
		}
	})

	res.send(cards);
}