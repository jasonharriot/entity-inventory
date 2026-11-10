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
		if(this.has(p.name)){	//Don't modify anything if the permission is already held.
			return;
		}

		this.permissions.push(p);

		if(!this.hierarchy[p.name]) return;	//Return if no implied permissions.

		//Also grant permissions implied.
		for(let impliedPermission of this.hierarchy[p.name]){
			this.grant({
				name: impliedPermission,
				grantedByID: null,
				dateGranted: null,
				implied: true
			});
		}
	}

	has(p){
		const match = this.permissions.filter((held) => held.name == p)

		return match.length > 0;
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

	namesToArray(){
		return this.permissions.map((p) => p.name);
	}

	toArray(){
		return this.permissions;
	}
}