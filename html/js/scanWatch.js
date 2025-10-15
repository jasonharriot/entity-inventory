//Watch for keyboard events from a USB / Bluetooth QR Code or barcode scanner.


const basicAllowedCharacters = `&()-_+=;:./?
abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ
0123456789`;	//A rudamentary list of all characters that could be in a URL we
// will accept as valid.
//Example URL: http://einventory.local/s/123456/?the=quick&brown=fox&jumps#

const shortcutBodgeCharacters = `-=;./`;	//Some of these keys may have an
//associated shortcut in browsers such as Firefox ('/', for quick find). When
//captured, prevent the default action for these keys only.

let cumulativeString = '';

let lastAppendTime = null;

function handleTypedURL(s){
	console.log('Received url:', s);
	window.location.href=s;
	return;
}

//const bElem = document.getElementsByTagName('body')[0];

//const inputCaptureElem = document.createElement('input');
//inputCaptureElem.setAttribute('type', 'hidden');
//inputCaptureElem.setAttribute('display', 'none');

//bElem.appendChild(inputCaptureElem);

document.addEventListener('keydown', (e) => {
	const now = new Date();

	const timeSinceLastAppend = now-lastAppendTime;	//Yields milliseconds

	if(lastAppendTime != null && timeSinceLastAppend > 100){	//If more time
		//than this has passed since the last keystroke, assume it is the start
		//of a new tag URL, and clear the old one.

		cumulativeString = '';
	}


	if(e.key == 'Enter'){
		handleTypedURL(cumulativeString);

	} else if(basicAllowedCharacters.indexOf(e.key) >= 0){
		if(shortcutBodgeCharacters.indexOf(e.key) >= 0){
			e.preventDefault();
		}

		cumulativeString += e.key;
		lastAppendTime = now;
	}
})