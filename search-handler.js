module.exports = function(req, res){
	console.log(`Search: ${req.params.searchString}`);

	const fieldsGroup1 = [
		'id',
		'type',
		'contents',
		'date_sample',
		'mass_initial',
		'parent_ids',
		'status',
		'container_size',
		'form',
		'date_experiment',
		'form',
		'notes'
	];

	const parameters = {}
	
	const fieldOps = [];
	//const terms = [];

	//TODO
	const term = req.params.searchString;
	//

	fieldsGroup1.forEach((field) => {
		const fieldOp = `${field} LIKE \$${field}`;	//Use the field name as a
		//named parameter, i.e. "foo LIKE $placeholder_called_foo"

		fieldOps.push(fieldOp);
		//terms.push(`term`);

		parameters[field] = `%${term}%`;	//Percent sign indicates wildcard of
		//any number of characters
		
	});

	const queryString = `SELECT * FROM cards WHERE (${fieldOps.join(` OR `)})`;

	//console.log(`Search terms: ${terms}`);

	//console.log(`Query string: ${queryString}`);

	const query = req.sqlite.prepare(queryString);
	const results = query.all(parameters);

	console.log(`Query yielded ${results.length} cards.`);

	res.send(results);
}