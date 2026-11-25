module.exports = function(req, res){
	let user = req.app.locals.authenticatedUser;

	if(!user){
		console.log('Cannot reset a password because no user logged in.');
		res.redirect('/login');
		return;
	}

	let targetUserID = req.body['user_id'];

	req.db.setFlag(targetUserID, 'password_reset');

	res.redirect(`/user-manage?id=${targetUserID}`);

	return;
}