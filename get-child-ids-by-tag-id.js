const {getCards} = require('./get-cards.js');
const {parseIDListString} = require('./parse-id-list-string.js');

module.exports = {
	getChildIDsByTagID: function(database, tagID){	//Get a list of card IDs for
		//cards who have the specified card (tagID) as a parent.

		const cards = getCards(database);	//All cards which have some info
		//filled out.

		const childCards = cards.filter((card) => {
			const parentIDs = parseIDListString(card.parent_ids);

			return parentIDs.includes(tagID);
		});

		if(childCards.length == 0){
			console.log(`No child cards exist for ${tagID}`);
			return [];
		}

		const childIDs = [];

		childCards.forEach((card) => {
			childIDs.push(card.id);
		});

		return childIDs;
	}
}