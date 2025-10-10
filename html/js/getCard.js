function getCard(){
	console.log('Getting card...');

	const params = new URLSearchParams(window.location.search);

	let tagid = 'n/a';

	if(params.has('tagid')){
		tagid = params.get('tagid');
	} else{
		console.log('No tag ID in URL.');
		return {};
	}

	return new Promise((resolve, reject) => {
		console.log(`Card tag ID is: ${tagid}`)
		fetch(`/api/card/${tagid}`).then(response => {	//Run the fetch. When we
			//have a response, check some things, then return a promise which
			//will resolve once the JSON data base been parsed.

			if(!response.ok){
				return Promise.reject('Response is not OK.');
			}

			return response.json();	//Begin parsing the JSON data.

		}).then((card) => {
			console.log('Received card info:', card);
			resolve(card);	//Resolve the outer promise, yielding the card JSON
			//to wherever we called getCard() from.

		});
	});
}