function getCard(tagID){
	return new Promise((resolve, reject) => {
		fetch(`/api/card/read/${tagID}`).then(response => {	//Run the fetch.
			//When we have a response, check some things, then return a promise
			//which will resolve once the JSON data base been parsed.

			if(!response.ok){
				return Promise.reject('Failed to fetch card, resposne code ' +
					response.status);
			}

			return response.json()	//Begin parsing the JSON
			//data.
				
		}).then((card) => {
			//console.log('Received card info:', card);
			resolve(card);	//Resolve the outer promise, yielding the card JSON
			//to wherever we called getCard() from.

		}).catch((e) => {
			console.error(`Couldn't get card with ID ${tagID}.`);
			console.error(e);

			reject();
		});
	});
}