//Enable the default scan handling (navigate to the URL as it appears in the QR
//code). This will not be used on pages that need custom handling (bulk
//operations, etc.)

document.addEventListener('tagscanned', (e) => {
	console.log('Tag scanned:', e.detail.url);
	window.location.href = e.detail.url;
});