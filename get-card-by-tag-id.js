module.exports = {
	getCardByTagID: function (database, id){
		let safeID = Number(id);
		
		if(isNaN(safeID)){
			console.error(`Bad tag ID: ${id}`);
			return null;
		}

		const query = database.prepare('SELECT * FROM cards WHERE id = ?');

		const entries = query.all(safeID);	//Insert the ID value into the query, and execute
		//it.

		// = query.all();

		//console.log(`There are ${entries.length} entries for ${safeID}`);

		if(entries.length > 1){
			throw new Error(`More than one card is not acceptable!`);
		}

		if(entries.length == 0){
			console.log(`No entries for ${safeID}.`);
			return null;
		}

		const card = entries[0];

		//console.log(card);

		return card;
	}
}