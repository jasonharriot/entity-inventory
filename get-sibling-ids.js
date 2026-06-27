const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');

module.exports = {
	getSiblingIDs :function(db, cardID, parentIDs){
		console.log(`Fetching siblings for ${cardID}. Parents: ${parentIDs}`);
		//console.log(`Fetching siblings for ${cardID}. Parents: ${parentIDs}`
		//	+ `, children: ${childIDs}`);

		let siblingIDs = [];

		parentIDs.forEach((parentID) => {
			let childIDs = getChildIDsByTagID(db, parentID);

			//siblingIDs = siblingIDs.concat(childIDs);

			childIDs.forEach((childID) => {
				if(siblingIDs.indexOf(childID) == -1 && childID != cardID){
					siblingIDs = siblingIDs.concat(childID);
					console.log(`Added: ${childID}`)
				} else{
					console.log(`Not a valid sibling: ${childID}`);
				}
			})
		});

		return siblingIDs;
	}
}