const authTools = require('./auth-tools.js');

module.exports = function(req, res){
	let authUser = req.app.locals.authenticatedUser;
	let sessionID = req.cookies['sessionid'];

	if(authUser && sessionID){
		authTools.deleteSessionBySessionID(req.sqlite, sessionID);

		console.log('Logged out with session ID.');
	} else{

		console.log('Didn\'t do anything.');
	}

	res.redirect('/');
}