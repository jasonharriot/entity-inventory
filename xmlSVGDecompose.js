const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');

module.exports = {
	xmlSVGDecompose: function(xmlString){
		let ret = {
			paths: [],
			viewBox: []
		};

		const parser = new XMLParser({
			ignoreAttributes: false,
			allowBooleanAttributes: true
		});

		let output = parser.parse(xmlString);

		console.log(output);

		output.svg.path.forEach((path) => {
			//Do stuff

			ret.paths.push(path);

		});

		ret.viewBox = output.svg['@_viewBox'].split(' ');




		return ret;	//Contains objects with '@_d' properties, and either
		//'@_fill' or '@_stroke' depending on the type.
	}
}