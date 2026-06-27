function getTagID(){
	const params = new URLSearchParams(window.location.search);

	let tagID = '';

	if(params.has('tagid')){
		tagID = Number(params.get('tagid'));
	} else{
		console.log('No tag ID in URL.');
		return null;
	}

	console.log(`Card tag ID is: ${tagID}`);

	return tagID;
}