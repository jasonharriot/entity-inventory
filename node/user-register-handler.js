const authTools = require('./auth-tools.js');

module.exports = function(req, res){
	let email = req.body['email'];
	let pw = req.body['password'];

	// function userError(msg){
	// 	res.redirect(`/register.html?msg=${encodeURIComponent(msg)}`);
	// 	return;
	// }
	if(!authTools.emailIsAcceptable(email)){
		// userError('E-mail address is not valid.');
		res.redirect('/register');
		return;
	}

	if(authTools.emailIsUsed(req.sqlite, email)){
		// userError('E-mail address is already in use.');
		res.redirect('/register');
		return;
	}
	
	if(!authTools.passwordIsAcceptable(pw)){
		// userError('Password is too short.');
		res.redirect('/register');
		return;
	}

	//The password and username are acceptable and we can modify the
	//database.

	authTools.createUser(req.sqlite, email, pw);

	res.redirect(`/login`);
	return
}