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

	fetch(`/api/card/${tagid}`).then(response => {	//Run the fetch. When we
		//have a response, check some things, then return a promise which will
		//resolve once the JSON data base been parsed.

		if(!response.ok){
			return Promise.reject('Response is not OK.');
		}

		return response.json();	//Begin parsing the JSON data.

	}).then(resJSON => {	//When the JSON data has been parsed, do stuff
		showCard(resJSON);
		
	}).catch( e => {
		console.error('Failed to get card info:', e);
	});
}