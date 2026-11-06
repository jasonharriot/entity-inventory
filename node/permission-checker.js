const config = require('config');

//Permission checker middleware.
//Wraps permission manager functionality for clean Express syntax

//Accepts a permission string or a list of permission strings.
//Checks if the user (authenticatedUser) has all of the listed permission(s).
//Check always fails if user is not logged in.

module.exports = (p) => {
	return (req, res, next) => {
		let permissions = [];

		if(p == undefined){
			permissions = [];
		} else if(!Array.isArray(p)){
			permissions = [p];
		} else{
			permissions = p;
		}

		//console.log('Permissions middleware: ', permissions)

		//Check if a user is logged in
		if(!req.app.locals.authenticatedUser){
			//res.writeHead(403, 'You must be logged in to do this.');
			let msg = 'Please login before doing that.'

			res.redirect(`/login?msg=${encodeURIComponent(msg)}`);
			res.end();
			return;
		}

		//Check if all required permissions are held
		//...

		if(!req.app.locals.authenticatedUser.permissions.hasAll(permissions)){
			//res.writeHead(403, 'The following permissions are required: ' + permissions.join(', '));
			res.render('permission-error.ejs', {requiredPermissions: permissions});
			return;
		}

		next();
	}
};