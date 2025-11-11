const buttonSaveElem = document.getElementById('buttonSave');
const buttonDiscardElem = document.getElementById('buttonDiscard');
const formEditElem = document.getElementById('formEdit');
const buttonTodayElem = document.getElementById('buttonToday');
const dateFieldElem = document.getElementById('fieldDateToday');

const tagID = getTagID();

buttonDiscardElem.addEventListener('click', () => {
	if(confirm('Really discard changes?')){
		window.location.href = `view-card.html?tagid=${tagID}`
	} 
});

buttonTodayElem.addEventListener('click', () => {
	const isEmpty = dateFieldElem.value == '';

	if(!isEmpty && !confirm(`Overwrite the existing date with today's date?`)){
		return;
	}

	const dateToday = moment().format('YYYY-MM-DD');

	dateFieldElem.value = dateToday;
});

getCard(tagID).then((card) => {
	showCard(card);

	document.title = `Edit: ${card.id}`;	//Change the tab title to
	//show that this tab is the Edit window.

	formEditElem.setAttribute('action', `api/card/write/${tagID}`);
	//Tell the form to POST to the API endpoint which includes the
	//correct tag ID.

}).catch( (e) => {
	console.error('Something went wrong:', e);
});