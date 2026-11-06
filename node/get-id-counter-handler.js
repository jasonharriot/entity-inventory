module.exports = function(req, res){
	let counter = req.db.getIDCounter();
	res.send(counter);
}