module.exports = (req, res) => {
	let revoking_user = req.app.locals.authenticatedUser.id;
	let perm = req.body['permission_name'];
	let user_id = req.body['user_id'];

	req.db.revokePermission(user_id, perm);

	res.redirect('/user-manage?id=' + user_id);
}