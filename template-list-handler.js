const fs = require('fs');

module.exports = function(req, res){
	fs.readdir('templates', (err, files) => {
		if(err){
			console.error(err);

			res.writeHead(500);
			res.end();
			return;
		}
		let validTemplates = [];	//contains partial filenames for which a
		//pdf file and a sidecar file exist.

		files.forEach( (file) => {
			const prefix = 'template_';	//Template files must start with this,
			//and this will be truncated from the template name.

			const suffix = '.pdf';	//Template files must end with this, and 
			//this will be truncated from the template name.

			if(file.startsWith(prefix) && file.endsWith(suffix)){
				let partial = file.slice(prefix.length,
					file.length - suffix.length);

				console.log(partial);

				const sidecarExists = fs.existsSync(`templates/template_\
${partial}.json`);

				if(sidecarExists){
					validTemplates.push(partial);
				} else{
					console.error(`PDF file has no matching sidecar: ${file}`);
				}
			}
		});

		console.log(`Found valid templates: ${validTemplates}`)

		res.end(JSON.stringify(validTemplates));
	});
}