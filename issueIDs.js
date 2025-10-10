const { getIDCounter } = require('./getIDCounter.js');

module.exports = {
	issueIDs: function(database, num){
		let idList = [];

		for(let i=0; i<num; i++){
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
