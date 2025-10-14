function createCardListTableHeader(columns){
	const row = document.createElement('tr');

	columns.forEach((column) => {
		const col = document.createElement('th');

		col.innerText = column.name;
		row.appendChild(col);
	})

	return row;
}

function createCardListTableRow(card, columns){
	const row = document.createElement('tr');

	columns.forEach((column) => {
		const col = document.createElement('td');

		if(column.field == 'id'){
			const anchor = document.createElement('a');
			anchor.href=`viewcard.html?tagid=${card.id}`;
			anchor.innerText = sampleIDString(card[column.field]);

			col.appendChild(anchor);
		} else{
			col.innerText = card[column.field];
		}

		row.appendChild(col);
	})

	return row;
}

const columns = [
	{
		'name': 'ID',
		'field': 'id'
	},
	{
		'name': 'Entity type',
		'field': 'type'
	},
	{
		'name': 'Contents',
		'field': 'contents'
	},
	{
		'name': 'Container size',
		'field': 'container_size'
	},
	{
		'name': 'Parent ID(s)',
		'field': 'parent_ids'
	},
	{
		'name': 'Date',
		'field': 'date_sample'
	},
	{
		'name': 'Date first modified',
		'field': 'date_modified_first'
	}
];

const cardListTableElem = document.getElementById(`cardListTable`);
const pTableMessageElem = document.getElementById(`pTableMessage`);

let header = createCardListTableHeader(columns);

fetch(`api/card/list`).then((response) => {
	if(!response.ok){
		console.error(`Fetch response not OK.`);
	}

	response.json().then((resJSON) => {
		pTableMessageElem.innerText = `${resJSON.length} cards`;
		let i=0; 
		resJSON.forEach((card) => {
			console.log(card.id);
			let r = createCardListTableRow(card, columns);

			if(i%2){
				r.classList.add('rowEven');

			} else{
				r.classList.add('rowOdd');
			}

			cardListTableElem.prepend(r);

			i++;
		});

		cardListTableElem.prepend(header);
	})
})