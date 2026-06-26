const authTools = require('./auth-tools.js');

module.exports = function(req, res){
	let email = req.body['email'];
	let pw = req.body['password'];

	if(req.app.locals.authenticatedUser){
		//userMessage('You are already logged in.');
		res.redirect('/user');
		return;
	}

	if(!authTools.emailIsAcceptable(email)){
		//userMessage('E-mail address is not valid.');
		res.redirect('/login');
		return;
	}
	
	//The email is acceptable and we can check the database.
	let user = authTools.getUserByEmail(req.sqlite, email);

	if(user && authTools.verifyPassword(pw, user.password_hash, user.password_salt, user.password_hash_iter)){
		authTools.logInUserByID(req.sqlite, user.id, res);

		res.redirect('/');
		return;
	}

	//userMessage('Incorrect e-mail or password. Please try again.');
	res.redirect('/login');
	console.log('Bad login:', email);
}