module.exports = function(req, res){
	let authUser = req.app.locals.authenticatedUser;
	let sessionID = req.cookies['sessionid'];

	if(authUser && sessionID){
		req.db.deleteSessionBySessionID(sessionID);

		console.log('Logged out with session ID.');
	} else{

		console.log('Didn\'t do anything.');
	}

	res.redirect('/');
}