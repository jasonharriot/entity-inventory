const {rgb} = require('pdf-lib');
const { xmlSVGDecompose } = require('./xmlSVGDecompose.js');

function hexToRGB(hex) {
	let hexWithoutPrefix = hex.slice(hex.indexOf('#')+1);
	//console.log(hexWithoutPrefix);
	var bigint = parseInt(hexWithoutPrefix, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;

	return rgb(r/255, g/255, b/255);
}

module.exports = {
	xmlSVGToPage: function(svg, page, pos, size){
		let decomp = xmlSVGDecompose(svg);

		console.log(decomp.viewBox);

		console.log(`Target QR code size is ${size} inches.`)

		console.log(`Current size of SVG viewbox is ${decomp.viewBox[2]} units.`)

		let scaleFactor = size/(decomp.viewBox[2]/72);	//Assume (it is unclear
		//if this is the intended behavior) that the QR code SVG viewbox is 
		//interpreted to be in points (1/72 of one inch) by pdf-lib. When dis-
		//played on the page, a 25-point qr code is 25/72 inches wide (and
		//tall). Scale accordingly so it is the intended size.

		decomp.paths.forEach((svg) => {

			let strokeColor = ('@_fill' in svg) ? hexToRGB(svg['@_fill']) : undefined;
			let fillColor = ('@_stroke' in svg) ? hexToRGB(svg['@_stroke']) : undefined;

			if(fillColor){
				return;
			}

			let unifiedColor = strokeColor ? strokeColor : fillColor;

			console.log(unifiedColor);

			page.drawSvgPath(svg['@_d'], {
				x: pos[0],
				y: pos[1],
				color: unifiedColor,
				opacity: .5,
				scale: scaleFactor
			})
		});
	}
}