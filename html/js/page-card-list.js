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
	/*{
		'name': 'Child ID(s)',
		'field': 'synth_child_ids'	//This is a synthetic field, we will
		//generate it on the fly. It is not present in the database.
	},*/
	{
		'name': 'Date',
		'field': 'date_sample'
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