module.exports = {
	updateCardOnScan: function(database, id){
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		//This is the current date in time in UCT (!!!). Remove the fractional
		//seconds and replace the T with a space.

		const query = database.prepare(`UPDATE cards SET date_scanned_first =
			case when date_scanned_first is '' then ? else date_scanned_first
			end, date_scanned_latest = ? WHERE id = ?`);

		const result = query.run(now, now, id);	//Insert the ID value into the
		//query, and execute it.

		console.log(`Executed update. Result:`);
		console.log(result);
	}
}