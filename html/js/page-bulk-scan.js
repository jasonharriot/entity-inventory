//The naming scheme of table on the bulk edit page. Same as the JSON API. 
//Properties that are fillable or both fillable and editable are in respective
//lists.

fillableNames = [
	"id"
]

editableNames = [
	"type",
	"contents",
	"date_sample",
	"parent_ids",
	"status",
	"container_size",
	"form",
	"notes"
]

//const buttonTagIDElem = document.getElementById('buttonTagID');
const inputTagIDElem = document.getElementById('inputTagID');
const buttonApplyElem = document.getElementById('buttonApply');

const tagID = getTagID();

let oldCard = null;
let newData = {};

let editsPending = false;

function iterBulkNames(f){	//Iterate all property names and generate
	//"new", "old", and "fillable" class names which may or may not have 
	//elements in the DOM. "Old" list is to be filled with data from the 
	//database, "new" list is to be filled after edits are calculated.

	editableNames.concat(fillableNames).forEach((name) => {
		let elemFillClass = 'fill-' + name;

		let elemOldClass = 'fill-' + name + '-old';
		let	elemNewClass = 'fill-' + name + '-new';

		let oldElems =
			Array.from(document.getElementsByClassName(elemOldClass))
			.concat(Array.from(document.getElementsByClassName(elemFillClass)));

		let newElems = document.getElementsByClassName(elemNewClass)
		

		f(name, oldElems, newElems)
	})
}

function getURLParamEdits(){
	let s = window.location.search
	let params = new URLSearchParams(s)

	let ret = {}

	for(let [key, value] of params){
		if(editableNames.includes(key)){
			ret[key] = value;
		} else{
			console.log('Not editing URL param:', key);
		}
	}

	return ret
}

function editApplicable(append, old){
	if(!old) return true;
	
	return !(old.toLowerCase().includes(append.toLowerCase()))
}

function computeNewValue(append, old, separator){
	if(!old || old.trim().length == 0) return append;	//New value is just the
	//edit if the old value is empty. !old catches null values.

	newValue = old + separator + append;

	return newValue;
}

function doApplyEdits(){
	let params = new URLSearchParams(newData);
	fetch(`/api/card/write/${tagID}?${params}`, {
		method: 'GET',
		headers: {
			'Content-type': 'application/json; charset=UTF-8'
		}
	}).then(() => {
		console.log('Fetch done.');
		window.location.reload();
	})
}

function goToTagID(id){	//Change the URL to reflect the specified tag ID, but 
	//leave edit parameters intact.

	let s = window.location.search
	let params = new URLSearchParams(s)	//Current tag ID, and edits

	params.set('tagid', id)

	let newURL = `${window.location.origin}${window.location.pathname}?${params}`;

	window.location.replace(newURL);
}

disableShortcutKeys();	//Changes the scan-watch script behavior. We don't want
//shortcut keys to be active on this page, but we do want tag scanning.


document.addEventListener('tagscanned', (e) => {
	console.log('Tag scanned:', e.detail.url)

	if(!e.detail.url) return;

	let scannedURL = URL.parse(e.detail.url);
	console.log(scannedURL.pathname)

	let newID = scannedURL.pathname.substr(1).split('/')[1]

	goToTagID(newID);
})

function useManualID(){
	let id = inputTagIDElem.value;

	if(id.length == 0) return;

	goToTagID(id);
}

//buttonTagIDElem.addEventListener('click', useManualID);

inputTagIDElem.addEventListener('change', useManualID);

//Add event listeners to apply edits:
buttonApplyElem.addEventListener('click', doApplyEdits);

if(tagID == null){
	//console.log('No tag ID. Doing nothing.');
} else{
	getCard(tagID).catch((e) => {
		console.log('Something went wront fetching ID', tagID, ':');
		console.log(e);

		alert('This card does not exist. The tag ID is invalid, or has not been'
		+ ' issued yet.\n(ID: ' + tagID + ')');
	}).then((card) => {
		oldCard = card;	//Set this for later access.

		document.title = `Bulk: ${card.id}`;	//Change the tab title to
		//show that this tab is the Edit window.

		/*for(let [key, value] of Object.entries(card)){
			if(bulkNames.includes(key)){	//If this property is one of the
				//ones we want to show and/or edit on this page, add it.
				oldData[key] = value;
			}
		}*/

		let edits = getURLParamEdits();	//Collect editable property names and
		//new values from the URL query string.

		//console.log('Edits:', edits);

		for(let [key, value] of Object.entries(edits)){
			//Iterate over the requested edits.

			if(!card.hasOwnProperty(key)) continue;	//If the API does not give
			//a value for this key, we cannot edit it.

			if(!editApplicable(value, card[key])) continue;	//If an edit is not
			//warranted (appended text already present, etc.).

			let separator = ', ';

			if(key == 'notes'){	//Special case for textarea
				separator = '\n';
			}

			let newValue = computeNewValue(value, card[key], separator);

			console.log('Valid edit:', card[key], '->', newValue);

			newData[key] = newValue;	//Append the edit to the old value and
			//store it in newData.

			editsPending = true;	//Flag for enabling apply button
		}

		iterBulkNames((name, olds, news) => {
			//Iterate through DOM elements that need to be filled.

			for(let e of olds){	//DOM elements that should be filled with
				//data as-is in the database without edits

				if(!card.hasOwnProperty(name)) continue;

				e.innerText = card[name];
			}

			for(let e of news){	//DOM elements that should be filled with the
				//edits applied

				if(!newData.hasOwnProperty(name)){
					if(edits.hasOwnProperty(name)){	//If there is a DOM element
						//that would otherwise be filled with a new value, but
						//no new value is present, and yet we are requesting
						//an edit to that property, the edit is redundant
						//and won't be made. Add a bit of text to make this
						//clear to the user.

						e.innerHTML = '<i>Redundant</i>'
						continue

					} else{
						continue
					}
				}

				//console.log(e, name, newData[name])
				e.innerText = newData[name];
			}
		})

		if(editsPending) buttonApplyElem.removeAttribute('disabled');

	})
}