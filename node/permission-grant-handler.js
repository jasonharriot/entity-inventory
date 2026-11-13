module.exports = (req, res) => {
	let granting_user_id = req.app.locals.authenticatedUser.id;
	let perm = req.body['permission_name'];
	let user_id = req.body['user_id'];

	perm = perm.trim();

	//res.redirect('/user-manage?id=' + user_id + '&msg=' + msg + '&msgType=error');

	let msg = null;

	if(perm.length <= 0){
		msg = 'Permission name too short or invalid.';
	} else if(perm.length > 64){
		msg = 'Permission name too long.';
	} else if(req.db.getPermissionsByUserID(user_id).has(perm)){
		msg = 'This user already holds that permission: "' + perm + '".';
	} else{
		if(!req.db.grantPermission(user_id, perm, granting_user_id)){
			let msg = 'You cannot grant that permission.';
			res.redirect('/user-manage?id=' + user_id + '&msg=' + msg + '&msgType=error');
			return;
		}

		res.redirect('/user-manage?id=' + user_id);
		return;
	}

	res.redirect('/user-manage?id=' + user_id + '&msg=' + encodeURIComponent(msg));
}