module.exports = function(req, res){
	let email = req.body['email'];
	let pw = req.body['password'];

	if(!req.db.emailIsAcceptable(email)){
		// userError('E-mail address is not valid.');
		res.redirect('/register');
		return;
	}

	if(req.db.emailIsUsed(req.sqlite, email)){
		// userError('E-mail address is already in use.');
		res.redirect('/register');
		return;
	}
	
	if(!req.db.passwordIsAcceptable(pw)){
		// userError('Password is too short.');
		res.redirect('/register');
		return;
	}

	//The password and username are acceptable and we can modify the
	//database.

	req.db.createUser(req.sqlite, email, pw);

	res.redirect(`/login`);
	return
}