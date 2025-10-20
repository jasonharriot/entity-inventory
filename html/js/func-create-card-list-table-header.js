function createCardListTableHeader(columns){
	const row = document.createElement('tr');

	columns.forEach((column) => {
		const col = document.createElement('th');

		col.innerText = column.name;
		row.appendChild(col);
	})

	return row;
}