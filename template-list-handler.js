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

				//console.log(partial);

				const sidecarFilename = `templates/template_${partial}.json`;

				try{
					const sidecar = JSON.parse(fs.readFileSync(sidecarFilename,
						'utf8'));

					sidecar['templateName'] = partial;	//Add this property to
					//make it prettier. It isn't actually found in the sidecar
					//file itself.

					validTemplates.push(sidecar);

				} catch(e){
					console.error(`Couldn't read sidecar file ${sidecarFilename}`);
					console.error(e);
					return;	//Move on to the next PDF file.
				}

				//const sidecarExists = fs.existsSync(`templates/template_\
//${partial}.json`);

				//if(sidecarExists){
					//validTemplates.push(partial);
				//} else{
				//	console.error(`PDF file has no matching sidecar: ${file}`);
				//}
			}
		});

		//console.log(`Found ${validTemplates.length} templates.`);

		res.end(JSON.stringify(validTemplates));
	});
}