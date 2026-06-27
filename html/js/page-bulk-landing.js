bulkSetupElemNames = [	//The naming scheme of bulk property checkboxes and
	//fields. Same as the JSON API. Will be sent to the scan page.

	"type",
	"contents",
	"date_sample",
	"parent_ids",
	"status",
	"container_size",
	"form",
	"notes"
]

function iterBulkSetup(f){
	bulkSetupElemNames.forEach((name) => {
		let checkElemName = 'bulk-check-' + name;
		let fieldElemName = 'bulk-field-' + name;

		let checkElem = document.getElementById(checkElemName)
		let fieldElem = document.getElementById(fieldElemName)

		f(name, checkElem, fieldElem)
	})
}

iterBulkSetup((name, checkElem, fieldElem) => {
	checkElem.addEventListener('input', (e) => {
		if(checkElem.checked){
			fieldElem.removeAttribute('disabled')
		} else{
			fieldElem.setAttribute('disabled', '')
		}
	})
})

document.getElementById('nextButton').addEventListener('click', (e) => {
	let data = {}

	iterBulkSetup((name, checkElem, fieldElem) => {
		cleanFieldText = fieldElem.value.trim();

		if(!checkElem.checked) return;
		if(cleanFieldText.length <= 0) return;

		//console.log(name, fieldElem.value)
		data[name] = cleanFieldText
	})

	let params = new URLSearchParams(data)

	//console.log(params)

	let newURL = '/bulk-scan.html?' + String(params);

	window.location.href = newURL;
})