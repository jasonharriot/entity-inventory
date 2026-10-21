const config = require('config');

module.exports = class PermissionManager{
	constructor(){
		this.permissions = []	//List of permissions granted.

		this.hierarchy = {	//List of other permissions that are implied by granting one permission
			'chief': ['officer'],
			'officer': ['read', 'write', 'issue_ids'],
			'read': ['login'],
			'write': ['login'],
			'issue_ids': ['login']
		}
	}

	grant(p){
		//If this permission has not been granted yet, push it to the list.
		if(this.permissions.indexOf(p) == -1){
			this.permissions.push(p)
		}

		//Also grant permissions implied.
		//If the permission does not appear in the hierarchy (as a key), then it has no implied permissions.
		if(!this.hierarchy[p]){
			return;
		}

		for(let impliedPermission of this.hierarchy[p]){
			this.grant(impliedPermission);
		}
	}

	has(p){
		if(this.permissions.indexOf(p) >= 0){
			return true;
		}

		return false;
	}

	hasAny(pList){
		for(let p of pList){
			if(this.has(p)){
				return true
			}
		}

		return false
	}

	hasAll(pList){
		for(let p of pList){
			if(!this.has(p)){
				return false;
			}
		}

		return true;
	}

	toArray(){
		return this.permissions;
	}
}