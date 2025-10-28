const { getCards } = require('./get-cards.js');

module.exports = function(req, res){
	const cards = getCards(req.sqlite);

	res.send(cards);
	res.end();
}