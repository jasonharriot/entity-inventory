function getFamily(tagID){
	return new Promise((resolve, reject) => {
		fetch(`/api/card/family/${tagID}`).then(response => {	//Run the fetch.
			//When we have a response, check some things, then return a promise
			//which will resolve once the JSON data base been parsed.

			if(!response.ok){
				return Promise.reject('Failed to fetch family, resposne code ' +
					response.status);
			}

			return response.json()	//Begin parsing the JSON
			//data.
				
		}).then((family) => {
			//console.log('Received card family:', family);
			resolve(family);	//Resolve the outer promise, yielding the JSON
			//to wherever we called getFamily() from.

		}).catch((e) => {
			console.error(`Couldn't get family for ID ${tagID}.`);
			console.error(e);

			reject();
		});
	});
}