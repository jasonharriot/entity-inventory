
module.exports = {
	getEntryByTagID: function (database, id){
		let safeID = Number(id);
		
		if(isNaN(safeID)){
			console.error(`Bad tag ID: ${id}`);
			console.error(e);
			return {};
		}

		const query = database.prepare('SELECT * FROM cards WHERE id = ?');

		const entries = query.all(safeID);	//Insert the ID value into the query, and execute
		//it.

		// = query.all();

		//console.log(`There are ${entries.length} entries for ${safeID}`);

		if(entries.length > 1){
			console.log(`More than one entry is not acceptable. Returning empty results.`);
			return {};
		}

		if(entries.length == 0){
			console.log(`No entries for ${safeID}.`);
			return {};
		}

		const entry = entries[0];

		//console.log(entry);

		return entry;
	}
}