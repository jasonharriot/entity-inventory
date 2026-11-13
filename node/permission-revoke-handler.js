module.exports = (req, res) => {
	let revoking_user_id = req.app.locals.authenticatedUser.id;
	let perm = req.body['permission_name'];
	let user_id = req.body['user_id'];

	if(!req.db.revokePermission(user_id, perm, revoking_user_id)){
		let msg = 'You cannot revoke that permission.';
		res.redirect('/user-manage?id=' + user_id + '&msg=' + msg + '&msgType=error');
		return;
	}

	res.redirect('/user-manage?id=' + user_id);
}