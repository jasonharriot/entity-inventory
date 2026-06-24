const authTools = require('./auth-tools.js');

module.exports = function(req, res){
	console.log('Changing password...');

	let user = authTools.getAuthenticatedUser(req.cookie);

	console.log(user)

	let newPW = req.body['password'];

	console.log('New password:', newPW);

	try{
		if(!authTools.passwordIsAcceptable(newPW)) throw new Error('Unacceptable password.');

		//The password is acceptable and we can modify the database.

	} catch (error){
		res.send('Password was not changed.<br>' + error);
		return;
	}

	res.send('Password was changed.');
}