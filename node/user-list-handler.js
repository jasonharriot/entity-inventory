const { getUsers } = require('./get-users.js');

module.exports = (req, res) => {
	let users = getUsers(req.sqlite);

	res.send(users);
	res.end();
}
