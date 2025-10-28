const { updateFields } = require('./update-fields.js');

module.exports = function(req, res){
	let tagID = req.params.tagid;

	let query = req.query;

	const editableFields = [
		'type', 
		'contents',
		'date_sample',
		'mass_initial',
		'parent_ids',
		'status',
		'container_size',
		'form',
		'date_experiment',
		'notes'
		];

	const data = Object.entries(query);

	for(let [queryField, queryValue] of data){	//Check if 
		//allowed to update field and (TODO) validate input

		console.log(`Write: ${queryField}: "${queryValue}"`);

		if(editableFields.includes(queryField)){
			//console.log('Can edit.');

		} else{
			console.log(`Client attempted to write to illegal field \
				${queryField}.`);
			res.send(`Field is not writable: ${queryField}`);
			res.writeHead(400);
			res.end();
			return;
		}
	}

	updateFields(req.sqlite, tagID, data);

	res.redirect(`../../../view-card.html?tagid=${tagID}`);
}