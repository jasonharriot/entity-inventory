module.exports = function(req, res, next){
	if(!req.body || !req.body.query_string){
		console.error(`Body does not contain a valid search query.`);
		next();
		return;
	}

	const searchQueryString = req.body.query_string;

	console.log(`Search: ${searchQueryString}`);

	let results = req.db.searchCards(searchQueryString);

	res.send(results);

	next();
}