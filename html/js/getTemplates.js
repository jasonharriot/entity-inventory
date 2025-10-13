function getTemplates(){
	return new Promise((resolve, reject) => {
		fetch('api/getTemplates').then(response => {

			if(!response.ok){
				return Promise.reject(`Got bad response trying to fetch
					templates`);
			}

			return response.json();
		}).then((templates) => {
			console.log(`Fetched templates: ${templates}`);
			resolve(templates);
		}).catch((e) => {
			console.error(`Couldn't fetch templates.`);
			console.error(e);
		})
	});
}