

module.exports = class Database{
	constructor(path){
		this.dbSync = new DatabaseSync(this.path);

		this.prepGetUsers = this.dbSync.prepare('SELECT * FROM users');
	}

	getUsers(){
		const users = this.prepGetUsers.all();

		users.forEach((user, i) => {
			//TODO: insert permissions
		});

		return users;
	}
}