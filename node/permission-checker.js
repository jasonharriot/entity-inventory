const config = require('config');

//Permission checker middleware.
//Wraps permission manager functionality for clean Express syntax

//Accepts a permission string or a list of permission strings.
//Checks if the user (authenticatedUser) has all of the listed permission(s).
//Check always fails if user is not logged in.

module.exports = (p) => {
	let permissions = [];

	if(p == undefined){
		permissions = [];
	} else if(!Array.isArray(p)){
		permissions = [p];
	} else{
		permissions = p;
	}

	console.log('Permission checker: ', permissions)

	return (req, res, next) => {
		//Check if a user is logged in
		if(!req.app.locals.authenticatedUser){
			res.writeHead(403, 'You must be logged in to do this.');
			res.end();
			return;
		}

		//Check if all required permissions are held
		//...

		if(!req.app.locals.authenticatedUser.permissions.hasAll(permissions)){
			res.writeHead(403, 'The following permissions are required:', permissions.join(', '));
			res.end();
			return;
		}

		next();
	}
};