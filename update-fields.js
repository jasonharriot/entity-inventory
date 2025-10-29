module.exports = {
	updateFields: function(database, id, data){
		let safeID = Number(id);
		
		if(isNaN(safeID)){	//TODO: is sanitization needed here if prepared 
			//statements are used?

			console.error(`Bad tag ID: ${id}`);
			console.error(e);
			return;
		}

		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		//This is the current date in time in UCT (!!!). Remove the fractional
		//seconds and replace the T with a space.

		const q1 = database.prepare(`UPDATE cards SET date_modified_first =
			case when ifnull(date_modified_first, '') is '' then ? else
			date_modified_first end, date_modified_latest = ? WHERE id = ?`);
		//Update the date_modified_first field if it is null or empty (''), 
		//otherwise set it to its current value (make no change). Also, set
		//date_modified_latest to the current date in all cases.

		const result = q1.run(now, now, id);	//Insert the ID value into the
		//query, and execute it.

		for([field, value] of data){	//TODO: This is bad practice, do not
			//allow partial writes

			const queryString = `UPDATE cards SET ${field}=? WHERE id=?`;
			//console.log(queryString);
			const q2 = database.prepare(queryString);
			const result = q2.run(value, safeID);
			//console.log(result);
		}
	}
}