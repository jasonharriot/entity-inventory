const buttonSaveElem = document.getElementById('buttonSave');

const buttonDiscardElem = document.getElementById('buttonDiscard');

const formEditElem = document.getElementById('formEdit');

const tagID = getTagID();

buttonDiscardElem.addEventListener('click', () => {
	if(confirm('Really discard changes?')){
		window.location.href = `view-card.html?tagid=${tagID}`
	} 
});

getCard(tagID).then((card) => {
	showCard(card);

	formEditElem.setAttribute('action', `api/card/write/${tagID}`);
	//Tell the form to POST to the API endpoint which includes the
	//correct tag ID.

}).catch( (e) => {
	console.error('Something went wrong:', e);
});