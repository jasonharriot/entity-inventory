const {PDFDocument, StandardFonts} = require('pdf-lib');
const { issueIDs } = require('./issueIDs.js');
const fs = require('node:fs');
const qr = require('qrcode');

const { sampleIDString } = require('./sampleIDString.js');

module.exports = {
	SheetManager: class{
		constructor(path, labelOffset, labelSpacing, labelNum, tagOffset){
			this.templateFilePath = path;
			this.labelOffset = labelOffset;	//Where is the top left of the first
			//label, relative to the top left of the page?

			this.labelSpacing = labelSpacing;	//The [horizontal, vertical]
			//spacing between two labels. Equal to the size of the label itself
			//if there is to be no gap between them.

			this.labelNum = labelNum;

			this.tagOffset = tagOffset;

			this.tagBase = 'http://einventory.local/s/'	//QR codes have URLs like:
			//"einventory.local/s/10229"

			this.tagSize = .6;	//QR code size, in inches.

			this.pageSize = [8.5, 11];	//Letter size label sheets
		}

		getPositions(){	//Get the x, y positions of each label, in inches
			//TODO: bottom left origin, units.

			const positions = [];

			for(let iy=0; iy<this.labelNum[1]; iy++){
				for(let ix=0; ix<this.labelNum[0]; ix++){
					const xPos = this.labelOffset[0] + this.labelSpacing[0]*ix;
					const yPos = this.pageSize[1] - this.labelSpacing[1] - this.labelOffset[1] - this.labelSpacing[1]*iy;

					const pos = [xPos, yPos];

					positions.push(pos);
				}
			}

			return positions;
		}

		getLabelCount(){
			return this.labelNum[0]*this.labelNum[1];
		}

		getQRCodePNGB64(id){
			let filePath = `./qrtemp/${id}.png`;

			return new Promise((resolve, reject) => {
				qr.toFile(
					filePath,
					this.tagBase + id,
					{
						color: {
							dark: '#000000',
							light: '#ffffff'
						},
						width: 300,
						scale: 1,
						type: 'png',
						margin: 0,
						errorCorrectionLevel: 'M'
					},
					(err)=>{
						if(err){
							reject();
						}

						try{
							let data = fs.readFileSync(filePath);

							fs.unlinkSync(filePath);	//Delete the file.

							resolve(data.toString('base64'));

						} catch(err){
							console.error('Could not read PNG file at ' + filePath);
							console.error(err);
							reject();
						}
					})
			})
		}

		getQRCodePNGArray(ids){
			return new Promise((resolveMain, rejectMain) => {
				let qrCodePNGs = [];	//Contains all the PNG images for each
				//qr code.

				let qrCodePNGPromises = [];	//Contains all the promises which
				//are loading PNG data into the "qrCodePNGs" array.

				for(let i=0; i<ids.length; i++){
					let thisID = ids[i];

					let thisProm = new Promise(resolveSub => {	//
						this.getQRCodePNGB64(thisID).then((pngData) => {
							qrCodePNGs[i] = pngData;

							resolveSub();	//Resolve this sub-promise only
							//after the PNG data has been inserted into the
							//array. 
						});
					});

					qrCodePNGPromises[i] = thisProm;	//Keep track of this
					//sub-promise so we can wait for it to finish.

				}

				Promise.all(qrCodePNGPromises).then((data) => {	//Wait for all
				//the promises to resolve. Don't need to do anything with the
				//data.

					resolveMain(qrCodePNGs);	//Finally, resolve the outer
					//promise with all the PNG image data(s).
				});
			});
		}

		embedPNGs(doc, arr){
			return new Promise((resolve, reject) => {

				let promises = [];

				arr.forEach((e) => {
					let prom = doc.embedPng(e);

					promises.push(prom);
				});

				Promise.all(promises).then(values => {
					resolve(values);
				});
			});
		}

		getTemplateDoc(){
			return new Promise((resolve, reject) => {
				fs.readFile(this.templateFilePath, (err, data) => {
					if(err) {
						console.error(err);
						reject();
						return;
					}

					PDFDocument.load(data).then((doc) => {
						resolve(doc);
					}).catch((err)=>{
						console.error(err);
						console.log('An error occured while loading the PDF file.')
					});
				});
			});
		}

		makePage(database, templatePage, doc){
			const newIDs = issueIDs(database, this.getLabelCount());	//
			//Generate tag IDs for each label on this page

			let newPage = doc.addPage([this.pageSize[0]*72, this.pageSize[1]*72]);

			return new Promise((resolve, reject) => {
				const promises1 = [
					this.getQRCodePNGArray(newIDs)	//Fetch all QR PNGs. This
					//must be done first because we need to embed them next.
				]

				Promise.all(promises1).then(values1 =>{	//TODO: Can this promise
					//structure be made cleaner? It grows to the right...


					let pngArray = values1[0];	//Extract the respective
					//results.

					const promises2 = [
						this.embedPNGs(doc, pngArray),	//Embed all the PNG images
						doc.embedPage(templatePage),	//Set up the embed of our 
						//template label page inside the main document
						doc.embedFont(StandardFonts.CourierBold)	//TODO: Can we
						//streamline this so it's only embedded once? What
						//happens if it is embedded multiple times?
					]

					Promise.all(promises2).then(values2 =>{
						let embeddedPNGs = values2[0];
						let embeddedPage = values2[1];
						let embeddedFont = values2[2];

						let positions = this.getPositions();

						for(let i=0; i<positions.length; i++){	//Index for
							//positions and ids. Should be same length.

							let thisID = newIDs[i];

							let thisPNG = embeddedPNGs[i];

							let thisPosition = positions[i];

							//Position of BL corner of label in inches, from BL of
							//page.

							let thisLabelX = thisPosition[0];
							let thisLabelY = thisPosition[1];

							newPage.drawPage(embeddedPage, {
								x: thisLabelX*72,
								y: thisLabelY*72
							});

							let thisTagX = (thisLabelX + this.tagOffset[0]);
							let thisTagY = (thisLabelY + this.tagOffset[1]);

							newPage.drawImage(thisPNG, {
								x: thisTagX*72,
								y: thisTagY*72,
							
								width: this.tagSize*72,
								height: this.tagSize*72,
								opacity: 1
							});

							newPage.drawText(sampleIDString(thisID), {
								x: (thisTagX-.05)*72, 
								y: (thisTagY-.15)*72,
								size:14,
								font: embeddedFont
							});

							/*newPage.drawText(`No. ${i+1}`, {	//Debugging text
								//shows the order of the labels on the sheet.
								x: thisLabelX*72, 
								y: thisLabelY*72,
								size:6
							});*/
						}

						//Footer
						let footerString = 'PRINT ONLY ONE COPY. DO NOT SAVE THIS FILE. '
						+ new Date().toISOString()

						newPage.drawText(footerString, {
								x: .5*72, 
								y: .25*72,
								size:12
							});

						newPage.drawText(footerString, {
								x: .5*72, 
								y: (this.pageSize[1]-.35)*72,
								size:12
							});

					}).then(resolve);	//Finally, resolve the outer promise
					//indicating we are done doing stuff to the document.

				});
			});
		}

		makeDocument(database, numPages){	//Generate pages
			return new Promise((resolve, reject) => {
				PDFDocument.create().then((doc, rej) => {

					if(rej){
						console.log("Something went wrong. No document was created.");
						reject();

						return;	//<-- Is this unreachable?
					}

					this.getTemplateDoc().then((tDoc) => {
						//resolve(tDoc);	//As a test, we can just send the
						//template file as-is.

						let templatePage = tDoc.getPages()[0];	//Only try to
						//embed the first page of the template document.

						this.makePage(database, templatePage, doc).then(() => {
							resolve(doc);	//The Promise returned by makePage
							//will resolve when the page has been appended to 
							//doc. Then resolve this function (makeDocument)
							//with doc.
							//makePage's promise resolves with no content. (TODO?)

						});
					})
				});
			});
		}
	}
}