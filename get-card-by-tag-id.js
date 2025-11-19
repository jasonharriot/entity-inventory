//const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');
const { parseIDListString } = require('./parse-id-list-string.js');

module.exports = {
	getCardByTagID: function (database, id){
		const query = database.prepare('SELECT * FROM cards WHERE id = ?');

		const cards = query.all(id);	//Insert the ID value into the
		//query, and execute it.

		if(cards.length > 1){
			throw new Error(`More than one card is not acceptable!`);
		}

		if(cards.length == 0){
			//console.log(`No cards for ${id}.`);
			return null;
		}

		const card = cards[0];

		const parentIDs = parseIDListString(card.parent_ids);

		card['synth_parent_ids'] = parentIDs; //We already have the parent IDs,
		//so just parse it to a list and insert it here.

		//const childIDs = getChildIDsByTagID(database, id);	//Search for 
		//cards who have this ID listed as a parent ID.

		//const siblingIDs = getSiblingIDs(database, id, parentIDs);
		//Search for cards who share at least one parent with the specified
		//card.

		//card['synth_child_ids'] = childIDs;	//Insert the synthetic lists.
		//card ['synth_sibling_ids'] = siblingIDs;

		//These synth_xxx properties are proper arrays, which are easier
		//to handle on the client side than strings (e.g. card.parent_ids).

		return card;
	}
}