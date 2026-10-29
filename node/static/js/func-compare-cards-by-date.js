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