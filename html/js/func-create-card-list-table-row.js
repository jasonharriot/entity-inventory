function createCardListTableRow(card, columns){
	const row = document.createElement('tr');

	columns.forEach((column) => {
		const col = document.createElement('td');

		if(column.field == 'id'){	//For the tag ID number column, create an
			//anchor which links to the view-card page for that entity.

			const anchor = document.createElement('a');
			anchor.href=`view-card.html?tagid=${card.id}`;

			//anchor.innerText = sampleIDString(card[column.field]);
			anchor.innerText = card[column.field];

			col.appendChild(anchor);

		} else{	//For all other fields, plain text.
			col.innerText = card[column.field];
		}

		if(column.field.indexOf('date') >= 0){	//All fields which are
			//dates contain the string 'date', followed by some other words.
			//Apply monospace font family to all these columns. 
			
			col.classList.add('columnTypeDate');
		}

		row.appendChild(col);
	});

	return row;
}