module.exports = function(req, res){	//Send the whole database file.

	const timestamp = new Date().toISOString().slice(0, 19)
		.replace('T', '_'.replace(':', '-'));

	const filename = `db_${timestamp}.sqlite`;

	console.log(`Sending database file: ${filename}`);

	res.download('db.sqlite', filename, (err) => {
		if(err){
			console.error('There was an error sending the database file.');
			console.error(err);
		} else{
			console.log('Success!');
		}
	});
}