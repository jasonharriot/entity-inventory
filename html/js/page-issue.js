let buttonIssueElem = document.getElementById('buttonIssuePDF');

let inputPageCountElem = document
	.getElementById('inputPageCount');

let selectTemplateElem = document
	.getElementById('selectTemplate');

getTemplates().then((templates) => {
	templates.forEach((template) => {
		let elem = document.createElement('option');
		elem.value = template;
		elem.innerText = template;

		selectTemplateElem.appendChild(elem);
	})
});

buttonIssueElem.addEventListener('click', () => {
	let num=Number(inputPageCountElem.value);

	let templateIndex = selectTemplateElem.selectedIndex;

	let templateDisplayText = selectTemplateElem
		.options[templateIndex];

	let templateValue = selectTemplateElem.value;

	if(templateValue.length == 0){
		alert('Select a template.');
		return;
		
	} else if(isNaN(num) || num <= 0 || num >= 50){
		alert('Enter a valid number of pages. (minimum 1, maximum 100)');
		return;
	}



	window.open(`api/sheet/generate/${templateValue}/${num}`, 
		'_blank');
})