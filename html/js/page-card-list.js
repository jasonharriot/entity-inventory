const columns = [
	{
		'name': 'ID',
		'field': 'id'
	},
	{
		'name': 'Date',
		'field': 'date_sample'
	},
	{
		'name': 'Contents',
		'field': 'contents'
	},
	{
		'name': 'Entity type',
		'field': 'type'
	},
	
	{
		'name': 'Container size',
		'field': 'container_size'
	},
	{
		'name': 'Parent ID(s)',
		'field': 'parent_ids'
	}
	/*{
		'name': 'Child ID(s)',
		'field': 'synth_child_ids'	//This is a synthetic field, we will
		//generate it on the fly. It is not present in the database.
	},*/
];

const cardListTableElem = document.getElementById(`cardListTable`);
const pTableMessageElem = document.getElementById(`pTableMessage`);

function compareCardsByDate(a, b){
	const dateA = parseDate(a.date_sample);
	const dateB = parseDate(b.date_sample);

	if(dateA < dateB){
		//console.log(dateA, '<', dateB);
		return -1;
	}

	if(dateA > dateB){
		//console.log(dateA, '>', dateB);
		return 1;
	}

	return 0;
}

let header = createCardListTableHeader(columns);

fetch(`api/card/list`).then((response) => {
	if(!response.ok){
		console.error(`Fetch response not OK.`);
	}

	response.json().then((resJSON) => {
		pTableMessageElem.innerText = `${resJSON.length} cards`;
		let i=0;

		const sortedCardList = resJSON.sort((a, b) =>
			compareCardsByDate(a, b, 'date_sample'));	//TODO: This parses
		//the same date strings multiple times. Would be faster if parsed
		//dates were inserted as synthetic properties in each card object, e.g.
		//[{synth_date_sample: Moment(this.date_sample), ...}, ...]

		sortedCardList.forEach((card) => {
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