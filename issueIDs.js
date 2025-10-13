const { getIDCounter } = require('./getIDCounter.js');
const { getEntryByTagID } = require('./getEntryByTagID.js');

module.exports = {
	issueIDs: function(database, num){
		let idList = [];

		const minimumTagID = 1000;	//Start all tags from this number up. Do not
		//issue any cards with tag IDs below this number.

		let i=0;

		const minimumEntry = getEntryByTagID(database, minimumTagID)

		if(minimumEntry == null){
			console.log(`Adding minimum-id entry with id=${minimumTagID}`)

			const query = database.prepare(`INSERT OR IGNORE INTO cards(id) VALUES(?)`);
			query.run(minimumTagID);


			let lastID = getIDCounter(database);	//Should be equal to 
			//minimumTagID.

			idList.push(lastID);

			i++;
		}

		for(;i<num; i++){
			database.exec(`INSERT INTO cards DEFAULT VALUES`);	//All values
			//will take on default state.

				

			let lastID = getIDCounter(database);	//The ID of the entry we
			//insert comes from the autoincrement behavior of the ID field. We
			//never ask for a specific ID.

			idList.push(lastID);
		}

		return idList;
	}
}
