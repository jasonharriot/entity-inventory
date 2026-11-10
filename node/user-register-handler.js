module.exports = function(req, res){
	let email = req.body['email'];
	let pw = req.body['password'];

	if(!req.db.emailIsAcceptable(email)){
		let msg = "E-mail address is not acceptable.";
		res.redirect(`/register?msg=${encodeURIComponent(msg)}&msgType=error`);
		return;
	}

	if(req.db.emailIsUsed(email)){
		let msg = "E-mail address is already in use.";
		res.redirect(`/register?msg=${encodeURIComponent(msg)}&msgType=error`);
		return;
	}
	
	if(!req.db.passwordIsAcceptable(pw)){
		let msg = "Password is not acceptable.";
		res.redirect(`/register?msg=${encodeURIComponent(msg)}&msgType=error`);
		return;
	}

	//The password and username are acceptable and we can modify the
	//database.

	req.db.createUser(email, pw);

	msg = 'Registration successful. Please log in:'

	res.redirect(`/login?msg=${encodeURIComponent(msg)}&msgType=success`);
	return
}