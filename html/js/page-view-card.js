//Display the parent and child entity tables on the "view card" page.

const buttonEditElem = document.getElementById('buttonEdit');

const parentCardTableElem = document.getElementById(`parentCardTable`);
const childCardTableElem = document.getElementById(`childCardTable`);

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
	if(card == null){
		alert('This card does not exist. The tag ID is invalid, or \
			has not been issued yet.');

		history.back();
		return;
	}

	showCard(card)

	buttonEditElem.addEventListener('click', () =>  {
		const hrefString = `edit-card.html?tagid=${tagID}`;
		window.location.href = hrefString;
	});

	if(card.synth_parent_ids.length > 0){
		makeTableFromIDs(parentCardTableElem, columns, card.synth_parent_ids);
	} else{
		parentCardTableElem.innerText = "This entity has no parents."
	}

	if(card.synth_child_ids.length > 0){
		makeTableFromIDs(childCardTableElem, columns, card.synth_child_ids);
	} else{
		childCardTableElem.innerText = "This entity has no children."
	}

}).catch( (e) => {
	console.error(`Couldn't get card info for ID ${tagID}`);
	alert(`No card for ID ${tagID} exists.`);
});


