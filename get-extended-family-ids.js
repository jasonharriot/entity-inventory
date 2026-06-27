const { getChildIDsByTagID } = require('./get-child-ids-by-tag-id.js');
const { getCardByTagID } = require('./get-card-by-tag-id.js');

module.exports = {
	getExtendedFamilyIDs: function(db, baseID){
		let discoveredIDs = [];

		function discover(thisID){
			//console.log(`Checking ${thisID}`);
			if(discoveredIDs.indexOf(thisID) >= 0){
				//console.log(`Skipped ${thisID}`);
				return;
			}

			discoveredIDs = discoveredIDs.concat(thisID);
			//console.log(`Discovered: ${thisID}. Total: `
			//	+ `${discoveredIDs.length}`);

			const card = getCardByTagID(db, thisID);
			//console.log(card.synth_parent_ids);
			if(card) card.synth_parent_ids.forEach(discover);

			const childIDs = getChildIDsByTagID(db, thisID);
			//console.log(childIDs);
			childIDs.forEach(discover);
		}

		discover(baseID);	//Recursive search

		console.log(`Extended family: ${discoveredIDs.length} entities`);

		return discoveredIDs;
	}
}