const siteMap = {
	'Home': {
		_view: '/',
		'Login': {
			_view: '/login'
		},
		'Register': {
			_view: '/register'
		},
		'Cards': { 
			_view: '/',		//Doesn't have its own page yet
			'List': {
				_view: '/card-list'
			},
			'Chart': {	//Not shown
				_view: '/chart'
			},
			'Edit': {
				_view: '/edit-card'
			},
			'Go To ID': {
				_view: '/go-to-card'
			},
			'Issue': {
				_view: '/issue'
			},
			'Search': {
				_view: '/search'
			},
			'View': {
				_view: '/view-card'
			}
		},
		'Permission Error': {
			_view: '/permission-error'
		},
		'Bulk Operations': {
			_view: '/bulk-landing',	//Doesn't have its own page yet
			'Setup': {
				_view: '/bulk-landing',
				'Scan/Enter IDs': {
					_view: '/bulk-scan'
				}
			}
		},
		'Profile': {
			_view: '/user',
			'Change Password': {
				_view: '/pwchange'
			}
		},
		'Administration': {
			_view: '/',		//Doesn't have its own page yet
			'User List': {
				_view: '/user-list'
			},
			'User Profile': {
				_view: '/user-manage'
			},
			'Debugging Tools': {
				_view: '/debug'
			}
		}
	}
}

function getPathByViewName(viewName){
	function walk(parentPath, obj){
		if(obj._view == viewName){	//If this property is the view path
			return parentPath;
		}

		for(let nodeNameKey in obj){
			let nextNode = obj[nodeNameKey];

			if(typeof(nextNode) !== 'object') continue;	//Type will be object if the entry is an object (or Null!), so skip any other element.

			let newPathNode = {
				name: nodeNameKey,
				path: nextNode._view
			}

			let nextPath = parentPath.concat([newPathNode]);	//Copy the array and append the new element

			let ret = walk(nextPath, nextNode);

			if(ret) return ret;	//If the target path exists down this branch
		}

		return null;	//If no branches we have iterated over contain the target path
	}

	return walk([], siteMap);
}

module.exports = (req, res, next) => {	//Insert information to build the navigation bar
	// let path = req.originalUrl;

	// if(path[0] == '/') path = path.slice(1);

	// let parts = path.split('/');

	// let built = [{
	// 	name: 'Home',
	// 	path: '/'
	// }];

	//Get view name from req.originalUrl:

	let viewName = req.originalUrl.split('?')[0];

	//console.log(`Looking for ${viewName}`);

	//If it has a path in the site map, use it:

	let path = getPathByViewName(viewName);

	if(path){
		//console.log(`Found ${viewName}:`);
		//console.log(path);

		res.locals['navPath'] = path;

	} else{
		//console.log(`Couldn't find ${viewName} in site map. Returned: ${path}`);
		res.locals['navPath'] = [{
			name: 'Error',
			path: '.'
		}];
	}

	return next();
}