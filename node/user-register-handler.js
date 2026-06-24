const authTools = require('./auth-tools.js');

const hashIterations = 10000;	//The number of hash iterations. This must be 
//stored in the database alongside the hash and salt.

module.exports = function(req, res){
	console.log('Registering user...');

	let email = req.body['email'];
	let pw = req.body['password'];

	console.log('New user:', email);

	function userError(msg){
		res.redirect(`/register.html?msg=${encodeURIComponent(msg)}`);
		return;
	}

	try{
		if(!authTools.emailIsAcceptable(email)){
			userError('E-mail address is not valid.');
			return;
		}

		if(authTools.emailIsUsed(req.sqlite, email)){
			userError('E-mail address is already in use.');
			return;
		}
		
		if(!authTools.passwordIsAcceptable(pw)){
			userError('Password is too short.');
			return;
		}

		//The password and username are acceptable and we can modify the
		//database.

		//Calculate the hash.

		let salt = authTools.generateSalt();

		let hash = authTools.hashPassword(pw, salt, hashIterations);

		let q = req.sqlite.prepare(`INSERT INTO users (email, password_hash, password_salt, password_hash_iter) VALUES (?, ?, ?, ?)`);
		let result = q.run(email, hash, salt, hashIterations);

		//msg = `E-mail: ${email}. Registration successful. Your account must be activated by an administrator.`;
		let msg = `E-mail: ${email}. Registration successful.`;

		// res.redirect(`/post-register.html?msg=${msg}`);
		res.redirect(`/login.html?msg=${msg}`);
		console.log('Success.');
		return

	} catch (error){
		userError('An error occured. Please try again.');
		console.log(error);
		return;

	}

	res.send('Password was changed.');
}