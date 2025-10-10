function showCard(c){	//Takes the fields supplied and displays them on the
	//page wherever the respective fill field is present

	fields = {
		fillContainerVolumeL: 'container_volume_L',
		fillContents: 'contents',
		fillDateExperiment: 'date_experiment',
		fillDateIssued: 'date_issued',
		fillDateSample: 'date_sample',
		fillDateScannedFirst: 'date_scanned_first',
		fillDateScannedLatest: 'date_scanned_latest',
		fillForm: 'form',
		fillTagID: 'id',
		fillMassInitialkg: 'mass_initial_kg',
		fillNotes: 'notes',
		fillParentIDs: 'parent_ids',
		fillStatus: 'status'
		
	}

	for(const [fillField, field] of Object.entries(fields)){
		let fieldValue = 'NO DATA';
		
		if(field in c){
			fieldValue = c[field];
		}

		for(fillElem of document.getElementsByClassName(fillField)){
			fillElem.innerText = fieldValue;
		}
	}
	
}