const authTools = require('./auth-tools.js');

module.exports = function(req, res){
	console.log('Changing password...');

	//let user = authTools.getAuthenticatedUser(req.cookie);

	let user = req.app.locals.authenticatedUser;

	if(!user){
		console.log('Cannot change password because no user logged in.');
		res.redirect('/login');
		return;
	}

	let newPW = req.body['new_password'];
	let oldPW = req.body['old_password'];

	let oldPassIsGood = authTools.verifyPassword(oldPW, user.password_hash, user.password_salt, user.password_hash_iter);

	let newPassIsGood = authTools.passwordIsAcceptable(newPW);

	if(!oldPassIsGood){
		console.log('Bad old password');
		res.redirect('/pwchange');
		return;
	}

	if(!newPassIsGood){
		console.log('Bad new password');
		res.redirect('/pwchange');
	}

	authTools.changePassword(req.sqlite, user.id, newPW);

	res.redirect('/user');

	return;
}