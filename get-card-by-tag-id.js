const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');
const { parseIDListString } = require('./parse-id-list-string.js');

module.exports = {
	getCardByTagID: function (database, id){
		let safeID = Number(id);
		
		if(isNaN(safeID)){
			console.error(`Bad tag ID: ${id}`);
			return null;
		}

		const query = database.prepare('SELECT * FROM cards WHERE id = ?');

		const cards = query.all(safeID);	//Insert the ID value into the query, and execute
		//it.

		if(cards.length > 1){
			throw new Error(`More than one card is not acceptable!`);
		}

		if(cards.length == 0){
			console.log(`No cards for ${safeID}.`);
			return null;
		}

		const card = cards[0];

		const childIDs = getChildIDsByTagID(database, safeID);	//Search for 
		//cards who have this ID listed as a parent ID.

		card['synth_child_ids'] = childIDs;	//Insert the
		//list here.

		card['synth_parent_ids'] = parseIDListString(card.parent_ids); //We 
		//already have the parent IDs, so just parse it to a list and insert it
		//here.

		//Both of these synth_xxx properties are full arrays, which are easier
		//to handle on the client side than strings.

		return card;
	}
}