const { getIDCounter } = require('./get-id-counter.js');

module.exports = function(req, res){
	let counter = getIDCounter(req.sqlite);
	res.send(counter);
}