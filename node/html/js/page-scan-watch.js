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

let shortcutKeysEnabled = true;

function disableShortcutKeys(){	//Quick way to disable shortcut keys in pages
	//where shortcuts are unacceptable but tag scanning will be done.
	shortcutKeysEnabled = false;
}

document.addEventListener('keydown', (e) => {
	const now = new Date();

	const timeSinceLastAppend = now-lastAppendTime;	//Yields milliseconds

	if(lastAppendTime != null && timeSinceLastAppend > 100){	//If more time
		//than this has passed since the last keystroke, assume it is the start
		//of a new tag URL, and clear the old one.

		cumulativeString = '';
	}

	if(e.key == 'Enter' && cumulativeString.startsWith('http')){
		//The URL from the QR code has been fully typed, and an event can be
		//dispatched so it can be handled.

		let tagScannedEvent = new CustomEvent('tagscanned', {
			detail:{
				url: cumulativeString
			}
		})

		document.dispatchEvent(tagScannedEvent);

		//console.log('Dispatched scan event! URL:', cumulativeString);

		return;

	} else{
		if(basicAllowedCharacters.indexOf(e.key) >= 0){
			if(shortcutBodgeCharacters.indexOf(e.key) >= 0){
				e.preventDefault();
			}

			cumulativeString += e.key.toLowerCase();	//Note: This toLowerCase
			//call fixes the issue where scanning a code does nothing if the caps
			//lock key is pressed, but means that the URLs on QR codes cannot
			//contain uppercase letters.

			lastAppendTime = now;
		}

		if(shortcutKeysEnabled){
			if(cumulativeString == 'g'){	//Hotkey for goto
				window.location.href = 'go-to-card.html';
			}

			if(cumulativeString == 'l'){	//Hotkey for list
				window.location.href = 'card-list.html';
			}

			if(cumulativeString == 's'){	//Hotkey for search
				window.location.href = 'search.html';
			}
		}
	}
})