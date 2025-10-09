
module.exports = {
	getIDCounter: function (database){
		const query = database.prepare('SELECT * FROM cards ORDER BY id DESC LIMIT 1');

		let counter = 0;

		if(query.all().length == 0){
			console.log('There are no rows. Assuming counter at zero.');
		} else{
			const lastRow = query.all()[0];
			counter = lastRow.id;
		}

		return counter;
	}
}