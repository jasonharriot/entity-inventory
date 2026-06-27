module.exports = function(req, res, next){
	if(!req.body || !req.body.query_string){
		console.error(`Body does not contain a valid search query.`);
		next();
		return;
	}

	const searchQueryString = req.body.query_string;

	console.log(`Search: ${searchQueryString}`);

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
	const term = searchQueryString;
	//

	fieldsGroup1.forEach((field) => {
		const fieldOp = `${field} LIKE \$${field}`;	//Use the field name as a
		//named parameter, i.e. "foo LIKE $placeholder_called_foo"

		fieldOps.push(fieldOp);
		//terms.push(`term`);

		parameters[field] = `%${term}%`;	//Percent sign indicates wildcard of
		//any number of characters
		
	});

	const sqlQueryString = `SELECT * FROM cards WHERE (${fieldOps.join(` OR `)})`;

	//console.log(`Search terms: ${terms}`);

	//console.log(`Query string: ${sqlQueryString}`);

	const query = req.sqlite.prepare(sqlQueryString);
	const results = query.all(parameters);

	console.log(`Query yielded ${results.length} cards.`);

	res.send(results);

	next();
}