const urlParams = new URLSearchParams(window.location.search);

//Put messages on the page from their URL search parameters.

let message = urlParams.get('msg');

if(message){
	messageElem = document.getElementById('fillMessage');
	messageElem.innerText = message;
	messageElem.removeAttribute('display');

	urlParams.delete('msg');

	let newPart = [window.location.pathname, '?', urlParams.toString()].join('');

	history.replaceState(null, '', newPart);
}