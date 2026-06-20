//Display the parent and child entity tables on the "view card" page.

const buttonEditElem = document.getElementById('buttonEdit');
const aChartElem = document.getElementById('aChart');

const parentCardTableElem = document.getElementById('parentCardTable');
const siblingCardTableElem = document.getElementById('siblingCardTable');
const childCardTableElem = document.getElementById('childCardTable');

const tagID = getTagID();

const columns = [	//Which columns to show for parent and child cards
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
	}
];

function makeTableFromIDs(tableElem, columns, IDs){
	if(!IDs || !IDs.length){
		tableElem.innerHTML = '<i>None.</i>';
		return;
	}

	let header = createCardListTableHeader(columns);

	let cardProms = [];

	IDs.forEach((id) => {
		let prom = new Promise((resolve, reject) => {
			getCard(id).then((card) => {
				resolve(card);
			}).catch(() => {
				resolve(null);
			});
		});

		cardProms.splice(0, 0, prom);
		//cardProms.push(prom);
	});

	Promise.all(cardProms).then((data) => {
		//console.log(`Received resolutions for ${data.length} cards.`);

		let i=0; 
		data.forEach((card) => {
			if(card == null){
				return;
			}
			
			let r = createCardListTableRow(card, columns);

			if(i%2){
				r.classList.add('rowEven');

			} else{
				r.classList.add('rowOdd');
			}

			tableElem.append(r);

			i++;
		});

		tableElem.prepend(header);
	});
}

getCard(tagID).then((card) => {
	showCard(card);

	buttonEditElem.addEventListener('click', () =>  {
		const hrefString = `edit-card.html?tagid=${tagID}`;
		window.location.href = hrefString;
	});

	aChartElem.href=`chart.html?tagid=${tagID}`;

	makeTableFromIDs(parentCardTableElem, columns, card.synth_parent_ids);

}).catch( (e) => {
	if(tagID > 0 && tagID <= 999){	//Inform the user that if an old 
		//numerical ID is in use, but has no database entry, they cannot
		//create an entry for it, and instead must use a new label, and
		//should reference the old label as the parent.
		
		alert('Attention! This ID is in the old format (< 1000), and does not' +
			' have an entry in the database. Please replace the old' +
			' sticker with a new printed label, and enter the old ID in' +
			' the Parent ID field.');
	} else{
		alert('This card does not exist. The tag ID is invalid, or has' +
			' not been issued yet.');
	}

	console.log(e);
});

getFamily(tagID).then((family) => {
	makeTableFromIDs(siblingCardTableElem, columns, family.sibling_ids);
	makeTableFromIDs(childCardTableElem, columns, family.child_ids);
}).catch( (e) => {
	console.error('Error while fetching family for ID ${tagID}');
	console.error(e);
})