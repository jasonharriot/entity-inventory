const authTools = require('./auth-tools.js');

module.exports = function(req, res){
	let email = req.body['email'];
	let pw = req.body['password'];

	function userMessage(msg){
		res.redirect(`/login.html?msg=${encodeURIComponent(msg)}`);
		return;
	}

	try{
		if(!authTools.emailIsAcceptable(email)){
			userMessage('E-mail address is not valid.');
			return;
		}
		
		//The email is acceptable and we can check the database.

		let user = authTools.getUserByEmail(req.sqlite, email);

		if(user && authTools.verifyPassword(pw, user.password_hash, user.password_salt, user.password_hash_iter)){
			authTools.logInUserByID(req.sqlite, user.id, res);

			res.redirect('/index.html');

			// console.log('OK login:', email);

			return;
		}
		

	} catch (error){
		userMessage('An error occured. Please try again.');

		console.log(error);

		return;

	}

	userMessage('Incorrect e-mail or password. Please try again.');

	console.log('Bad login:', email);
}