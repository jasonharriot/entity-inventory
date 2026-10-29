function getExtendedFamily(tagID){
	return new Promise((resolve, reject) => {
		fetch(`/api/card/extended-family/${tagID}`).then(response => {

			if(!response.ok){
				return Promise.reject('Failed to fetch extended family, '
					+ 'response code ' + response.status);
			}

			return response.json();
				
		}).then((exf) => {
			resolve(exf);

		}).catch((e) => {
			console.error(`Couldn't get extended family for ID ${tagID}.`);
			console.error(e);

			reject();
		});
	});
}