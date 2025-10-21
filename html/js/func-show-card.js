function showCard(c){	//Takes the fields supplied and displays them on the
	//page wherever the respective fill field is present

	fields = {
		fillContainerSize: 'container_size',
		fillContents: 'contents',
		fillDateExperiment: 'date_experiment',
		fillDateIssued: 'date_issued',
		fillDateSample: 'date_sample',
		fillDateScannedFirst: 'date_scanned_first',
		fillDateScannedLatest: 'date_scanned_latest',
		fillDateModifiedFirst: 'date_modified_first',
		fillDateModifiedLatest: 'date_modified_latest',
		fillForm: 'form',
		fillTagID: 'id',
		fillMassInitial: 'mass_initial',
		fillNotes: 'notes',
		fillParentIDs: 'parent_ids',
		fillStatus: 'status',
		fillType: 'type'
	}

	for(const [fillField, field] of Object.entries(fields)){
		let fieldValue = '';

		if(field in c){
			fieldValue = c[field];
		}

		let fillElem = document.getElementById(fillField)

		if(!fillElem){
			console.log(`Missing element for field ${fillField}`)
			continue;
		}

		if(fillElem.tagName == 'INPUT' || fillElem.tagName == 'TEXTAREA'){	//If the element is an input tag,
			//set the value property instead of inner text.

			fillElem.value = fieldValue;
			continue
		}

		/*if(fillElem.classList.contains('edit')){	//If this 
			//element has the edit class, then attach an event listener to open
			//the corresponding edit page when we click it.

			fillElem.addEventListener('click', () => {
				console.log(`Editing card for tag ID ${c.id}, field ${field}`)
				window.location.href = `editcard.html?tagid=${c.id}&field=${field}`
			})
		}*/

		if(field == 'notes' && fieldValue.length == 0){
			fillElem.innerHTML = '<i>No notes saved.</i>';
			continue;
		}

		fillElem.innerText = fieldValue;
	}
	
}