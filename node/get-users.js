module.exports = {
	getUsers: function(database){
		const q = database.prepare('SELECT * FROM users');

		const users = q.all();

		users.forEach((user, i) => {
			user[permissions]
		})

		return users;
	}
}