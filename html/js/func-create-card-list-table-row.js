function createCardListTableRow(card, columns){
	const row = document.createElement('tr');

	columns.forEach((column) => {
		const col = document.createElement('td');

		if(column.field == 'id'){
			const anchor = document.createElement('a');
			anchor.href=`view-card.html?tagid=${card.id}`;

			//anchor.innerText = sampleIDString(card[column.field]);
			anchor.innerText = card[column.field];

			col.appendChild(anchor);
		} else{
			col.innerText = card[column.field];
		}

		row.appendChild(col);
	})

	return row;
}