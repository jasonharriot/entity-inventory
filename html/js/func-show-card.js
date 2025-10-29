function showCard(c){	//Takes the fields supplied and displays them on the
	//page wherever the respective fill field is present

	const fields = {
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

	const fieldsFromUTC = [	//Take data for these fields and convert it from UTC to
		//the local timezone, then display it

		'date_issued',
		'date_scanned_first',
		'date_scanned_latest',
		'date_modified_first',
		'date_modified_latest'
		]

	for(const [fillClass, field] of Object.entries(fields)){
		let fieldValue = '';

		if(field in c){
			fieldValue = c[field];
		}

		let fillElemHTMLCollection = document.getElementsByClassName(fillClass);

		let fillElems = [...fillElemHTMLCollection]	//Use the spread operator
		//to convert the HTMLCollection to an Array.

		fillElems.forEach((fillElem) => {
			if(!fillElem){
				console.log(`Missing element for field ${fillClass}`)
				return;
			}

			if(fillElem.tagName == 'INPUT' || fillElem.tagName == 'TEXTAREA'){	//If the element is an input tag,
				//set the value property instead of inner text.

				fillElem.value = fieldValue;
				return
			}

			if(field == 'notes' && fieldValue.length == 0){
				fillElem.innerHTML = '<i>No notes saved.</i>';
				return;
			}

			if(fieldsFromUTC.indexOf(field) >= 0){	//If this is one of a few
				//select date fields which needs converting

				if(fieldValue.length == 0){	//If there is no date stored
					fillElem.innerText = '';
					return;
				}

				const m = moment.utc(fieldValue);

				const prettyDate = m.local().format('YYYY-MM-DD HH:mm:ss');
				//Display the date for the user in the local timezone.

				fillElem.innerText = prettyDate;

				return;
			}

			fillElem.innerText = fieldValue;
		});
	}
	
}