//Display the parent and child entity tables on the "view card" page.

const buttonEditElem = document.getElementById('buttonEdit');
const aViewCardElem = document.getElementById('aViewCard');

const parentCardTableElem = document.getElementById('parentCardTable');
const siblingCardTableElem = document.getElementById('siblingCardTable');
const childCardTableElem = document.getElementById('childCardTable');

const tagID = getTagID();

getCard(tagID).then((card) => {
	showCard(card);

	aViewCardElem.href = `view-card.html?tagid=${tagID}`;
});

let chart = null;

getExtendedFamily(tagID).then((cards) => {
	chart = new go.Diagram('chartContainer', {
		initialAutoScale: go.AutoScale.UniformToFill,
		//'panningTool.isEnabled': false,
		//'draggingTool.isEnabled': false,
		allowHorizontalScroll: false,
		allowVerticalScroll: false,
		isReadOnly: true,
		layout: new go.LayeredDigraphLayout({
			direction: 90
		})
	});

	chart.nodeTemplate = new go.Node('Spot', {
		selectable: false,
		locationSpot: go.Spot.Center
	}).add(
		new go.Shape('Rectangle', {
			fill: 'lightgray',
			stroke: null,
			desiredSize: new go.Size(80, 60)
		}),
		new go.TextBlock({
			maxSize: new go.Size(80, 60)
		}).bind('text')
	);

	chart.linkTemplate =
		new go.Link({
			selectable: false,
			corner: 10,
			curve: go.Curve.Bezier,
			fromEndSegmentLength: 30,
			toEndSegmentLength: 30
		}).add(
			new go.Shape({
				strokeWidth: 2,
				stroke: '#999'
			}),

			new go.Shape({
				scale: 1,
				stroke: '#000'
			}).bind('toArrow')
		);

	chart.startTransaction();

	//Construct node array

	let nodeArray = [];

	for(const [index, card] of cards.entries()){
		nodeArray.push({
			key: index,
			text: (card.dummy ? `${card.id} (?)` : `${card.id}`)
				+ '\n' + (card.dummy? `...` : `${card.contents}`),
			card: card
		});
	}

	console.log(nodeArray);

	chart.model.nodeDataArray = nodeArray;

	//Construct link array

	let linkArray = [];

	for(const [index, node] of nodeArray.entries()){
		if(node.card.dummy){
			continue;
		}

		node.card.synth_parent_ids.forEach((pID) => {
			const fromNode = nodeArray.find((e) => e.card.id == pID);
			const fromIndex = nodeArray.indexOf(fromNode);

			//console.log(`From ${pID} to ${node.card.id} (${fromIndex} to `
			//	+ `${index})`);

			linkArray.push({
				from: fromIndex,
				to: index,
				toArrow: 'Standard'
			});
		});
	}

	chart.model.linkDataArray = linkArray;

	chart.commitTransaction();

	chart.zoomToFit();
});