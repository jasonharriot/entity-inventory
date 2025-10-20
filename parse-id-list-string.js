module.exports = {
	parseIDListString: function(idString){	//Parses a list of tag IDs separated
		//by some characters. The handing implemented here should be robust to
		//work with different separators, encodings, and glyphs (different 
		//commas on iOS vs desktop, etc., tabs, semicolons...)

		const segments = idString.split(',');

		let IDs = [];

		//console.log('Parent ID string:', idString);

		segments.forEach((seg) => {
			const trimmed = seg.trim();
			//console.log(`Trimmed: "${trimmed}"`);

			if(trimmed.length == 0){
				return;
			}

			const id = Number(trimmed);

			//console.log('ID:', id);

			if(!isNaN(id)){
				IDs.push(id);
			} else{
				console.error(`Couldn't parse NaN parent ID: ${seg}`);
				return;
			}

		});

		return IDs;
	}
}