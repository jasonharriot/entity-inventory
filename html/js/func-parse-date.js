/*function parseDate(s){	//Parses the given date string to a Date object. 
	//Warning: If the date string does not contain any parseable timezone
	//information, the date will be assumed to be UTC, and the resulting Date
	//object will be shown in the timezone of your web browser/computer, and 
	//will therefore be incorrect.

	const date = new Date(Date.parse(s));

	//console.log(`${s} -> ${date.toISOString()}`);

	return date;
}*/

function parseDate(s){	//Parses the given date string to a Moment object. See
	//https://momentjs.com/docs/#/parsing/
	//for how parsing is handled. Moment (in most cases) assumes the local 
	//timezone when a string with no timezone information is given. In some 
	//cases, Moment cannot parse the date and falls back on Date, which has 
	//poor handling of dates without timezone information, and those in the 
	//"YYYY-MM-DD" format.

	if(!s || s.length == 0){	//Return null for impossible inputs
		return null;
	}

	const date = moment(s);

	console.log(s, '->', date.toString());

	if(!date.isValid()){	//Return null if parsing did not yield a valid date
		return null;
	}

	//console.log(`${s} -> ${date.toISOString()}`);

	return date;
}