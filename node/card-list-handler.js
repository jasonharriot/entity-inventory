module.exports = function(req, res){
	const cards = req.db.getCards();

	res.send(cards);
	res.end();
}