module.exports = function(req, res){
	let email = req.body['email'];
	let pw = req.body['password'];

	let badLoginMessage = 'Username and/or password are incorrect. Try again.';

	if(req.app.locals.authenticatedUser){
		res.redirect('/user');
		return;
	}

	if(!req.db.emailIsAcceptable(email)){
		res.redirect(`/login?msg=${encodeURIComponent(badLoginMessage)}&msgType=error`);
		return;
	}
	
	//The email is acceptable and we can check the database.
	let user = req.db.getUserByEmail(email);

	if(!user){
		res.redirect(`/login?msg=${encodeURIComponent(badLoginMessage)}&msgType=error`);

		console.log('Bad login:', email);

		return;
	}

	if(!user.permissions.has('login')){
		let msg = 'You do not have permission to log in. Please ask an officer to grant it to you.';

		res.redirect(`/login?msg=${msg}&msgType=error`);

		return;
	}

	if(req.db.passwordIsValid(pw, user.password_hash, user.password_salt, user.password_hash_iter)){
		req.db.logInUserByID(user.id, res);

		res.redirect('/');

		return;
	}

	res.redirect(`/login?msg=${encodeURIComponent(badLoginMessage)}&msgType=error`);
	console.log('Bad login:', email);
}