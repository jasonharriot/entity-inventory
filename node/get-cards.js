const { parseIDListString } = require('./parse-id-list-string.js');

module.exports = {
	getCards: function(database){
		const q = database.prepare(`SELECT * FROM cards WHERE (
			(contents IS NOT NULL AND contents <> '') OR
			(parent_ids IS NOT NULL AND parent_ids <> '') OR
			(type IS NOT NULL AND type <> '') OR
			(date_sample IS NOT NULL AND date_sample <> '')) AND
			((date_modified_first IS NOT NULL AND date_modified_first <> '') OR
			id < 1000)
			`);

		const cards = q.all();

		/*cards.forEach((card) => {	//TODO: We can create the synth_parent_ids
			//and synth_child_ids lists here, but synth_child_ids requires
			//a lot of code that is kind of duplicate to the code in
			//getChildIDsByTagID(). For now, only show synth lists in the card
			//view page.
			
			if(!card.synth_child_ids){
				card.synth_child_ids = [];
			}

			card.synth_parent_ids = parseIDListString(card.parent_ids);

			card.synth_parent_ids.forEach((parentID) => {
				const parentCard = cards.find((c) => c.id == parentID);

				if(!parentCard){
					console.log(`${card.id} has no parent card for parent ID \
${parentID}`)

					return;
				}

				if(!parentCard.synth_child_ids){
					console.log(`Parent card ${parentCard.id} has no \
synth_child_ids list. Initializing.`)

					parentCard.synth_child_ids = [];
				}

				let parentChildList = parentCard.synth_child_ids;

				if(!parentChildList.includes(card.id)){
					console.log(`Pushing ${card.id} to parent card ${parentID} \
child list.`);
					parentChildList.push(card.id);

				} else{
					console.log(`Parent card child list already includes \
${card.id}.`);

				}
			})
		})*/

		return cards;
	}
}