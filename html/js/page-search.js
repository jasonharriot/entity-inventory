let searchRequestState = false;
const inputSearchElem = document.getElementById("inputSearch");
const searchURL = 'api/search';

const resultTableMessageElem = document.getElementById('resultTableMessage');
const resultCardTableBodyElem = document.getElementById('resultCardTableBody');

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
];

const header = createCardListTableHeader(columns);

function createTable(json){
	resultTableMessageElem.innerText = `${json.length} cards`;

	resultCardTableBodyElem.replaceChildren();	//Clear all old entries.

	let i=0;

	const sortedCardList = json.sort((a, b) =>
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

		resultCardTableBodyElem.prepend(r);

		i++;
	});

	resultCardTableBodyElem.prepend(header);
}

function doSearch(){
	const now = new Date();

	if(!searchRequestState){

		const searchString = encodeURIComponent(inputSearchElem.value);

		if(searchString == ''){
			console.log('Empty search.');
			return;
		}

		console.log('Search string:', searchString);

		searchRequestState = true;

		const searchPromise = fetch(`${searchURL}/${searchString}`, {
			signal: AbortSignal.timeout(1000),	//Abort the search after this
			//time.

			cache: 'no-store',	//Do not retrieve from cache. Search results
			//may have changed even if query is the same.

			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}

		});

		searchPromise.then((e) => {
			searchRequestState = false;
			
			e.json().then((json) => {
				console.log(`Search results: ${json.length} cards`);
				createTable(json);
			}).catch((e) => {
				console.error(`Couldn't parse JSON response:`);
				console.error(e);
			});

		}).catch((e) => {
			searchRequestState = false;
			console.error('The search request failed');
			console.error(e);
		});
	} else{
		console.log('Skipped concurrent search request.');
	}
}

createTable([]);

inputSearchElem.focus();

inputSearchElem.addEventListener('change', (e)=>{
	doSearch();
})

inputSearchElem.addEventListener('keydown', (e) =>{
	if(e.key.toLowerCase() == 'enter'){
		doSearch();
	}
})

