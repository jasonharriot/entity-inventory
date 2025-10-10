function issue(template, num){
	console.log('Issuing PDF for template', template, ', page count', num);
}

let buttonIssueElem = document.getElementById('buttonIssuePDF');
let inputPageCountElem = document.getElementById('inputPageCount');
let selectTemplateElem = document.getElementById('selectTemplate');

buttonIssueElem.addEventListener('click', () => {
	let num=Number(inputPageCountElem.value);

	let templateIndex = selectTemplateElem.selectedIndex;
	let templateDisplayText = selectTemplateElem.options[templateIndex];
	let templateValue = selectTemplateElem.value;

	if(templateValue.length == 0){
		alert('Select a template.');
		return;
		
	} else if(isNaN(num) || num <= 0 || num >= 100){
		alert('Enter a valid number of pages. (minimum 1, maximum 100)');
		return;
	}



	issue(templateValue, num);
})