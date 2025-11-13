const buttonIssueElem = document.getElementById('buttonIssuePDF');

const inputPageCountElem = document
	.getElementById('inputPageCount');

const selectTemplateElem = document
	.getElementById('selectTemplate');

let templates = [];

function getNumPages(){
	return Number(inputPageCountElem.value);
}

function getCurrentTemplate(){
	const templateIndex = selectTemplateElem.selectedIndex;

	if(templateIndex < 0){
		return null;
	}

	return templates[templateIndex-1];
}

function updateInfo(){
	const template = getCurrentTemplate();

	let templateName = '';
	let labelSize = '';
	let pageSize = '';
	let labelsPerPage = 0;
	let labelsTotal = 0;

	if(template){
		templateName = template.templateName;
		labelSize = `${template.labelSize[0]} x ${template.labelSize[1]} in`;
		pageSize = `${template.pageSize[0]} x ${template.pageSize[1]} in`;
		labelsPerPage = template.labelNum[0]*template.labelNum[1];
		labelsTotal = labelsPerPage*getNumPages();
	}

	//document.getElementById('fillTemplateName').innerText = templateName;
	document.getElementById('fillLabelSize').innerText = labelSize;
	document.getElementById('fillPageSize').innerText = pageSize;
	document.getElementById('fillLabelsPerPage').innerText = labelsPerPage
	document.getElementById('fillLabelsTotal').innerText = labelsTotal;
}

getTemplates().then((t) => {
	templates = t;

	templates.forEach((template) => {
		let elem = document.createElement('option');
		elem.value = template.templateName;
		elem.innerText = template.templateName;

		selectTemplateElem.appendChild(elem);
	});
});

selectTemplateElem.addEventListener('change', () => {
	updateInfo();
});

inputPageCountElem.addEventListener('change', () => {
	updateInfo();
});

buttonIssueElem.addEventListener('click', () => {
	const templateValue = selectTemplateElem.value;
	const num = getNumPages();

	const maxNum = 20;

	if(templateValue.length == 0){
		alert('Select a template.');
		return;
		
	} else if(isNaN(num) || num <= 0 || num > maxNum){
		alert('Enter a valid number of pages. (minimum 1, maximum ' + maxNum + 
			')');
		return;
	}

	window.open(`api/sheet/generate/${templateValue}/${num}`, 
		'_blank');
})