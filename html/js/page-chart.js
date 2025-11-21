//Display the parent and child entity tables on the "view card" page.

const buttonEditElem = document.getElementById('buttonEdit');
const aViewCardElem = document.getElementById('aViewCard');

const parentCardTableElem = document.getElementById('parentCardTable');
const siblingCardTableElem = document.getElementById('siblingCardTable');
const childCardTableElem = document.getElementById('childCardTable');

const tagID = getTagID();

function nodeClickHandler(event, obj){
	const clickedID = obj.data.card.id;

	if(obj.data.card.dummy){
		alert(`There is no card for ID ${clickedID}. It is invalid, or has not`
			+ ` been issued yet.`);
	} else if(confirm(`View card details for ID ${clickedID}?`)){
		window.location.href=`view-card.html?tagid=${clickedID}`;
		//window.location.href=`chart.html?tagid=${clickedID}`;
	}
}

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
		//allowHorizontalScroll: false,
		//allowVerticalScroll: false,
		//allowZoom: false,
		//scrollMargin: new go.Margin(400, 400, 400, 400),
		scrollMode: "Infinite",
		isReadOnly: true,
		layout: new go.LayeredDigraphLayout({
			direction: 90
		})
	});

	chart.animationManager.initialAnimationStyle = go.AnimationStyle.None;

	//Make several node templates, add them to a map, then apply the map to the
	//chart.

	const margin = 10;

	const nodeSize = new go.Size(120, 90);
	const nodeTextSize = new go.Size(nodeSize.width-margin,
		nodeSize.height-margin);

	nodeTemplateNormal = new go.Node('Spot', {
		selectable: true,
		locationSpot: go.Spot.Center,
		click: nodeClickHandler
	}).add(
		new go.Shape('Rectangle', {
			fill: '#fff',
			stroke: '#000',
			strokeWidth: 1,
			desiredSize: nodeSize
		}),
		new go.TextBlock({
			maxSize: nodeTextSize
		}).bind('text')
	);

	nodeTemplateTarget = new go.Node('Spot', {
		selectable: false,
		locationSpot: go.Spot.Center,
		click: null	//No clicking the card you are already viewing!
	}).add(
		new go.Shape('Rectangle', {
			fill: '#fff0f0',
			stroke: '#f00',
			strokeWidth: 2,
			desiredSize: nodeSize
		}),
		new go.TextBlock({
			maxSize: nodeTextSize
		}).bind('text')
	);

	const nodeTemplateMap = new go.Map();

	nodeTemplateMap.add('', nodeTemplateNormal);	//Normal template, for when
	//specific template is unspecified

	nodeTemplateMap.add('Target', nodeTemplateTarget);

	chart.nodeTemplateMap = nodeTemplateMap;

	chart.linkTemplate =
		new go.Link({
			selectable: false,
			corner: 5,
			curve: go.Curve.Bezier,
			fromEndSegmentLength: 40,
			toEndSegmentLength: 40

		}).add(
			new go.Shape({
				strokeWidth: 2,
				stroke: '#000'
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
		let nodeText = `${card.id}\n(no entry)`;

		if(!card.dummy){
			nodeText = `${card.id}\n${card.contents}\n${card.container_size}`
			+ `\n${card.mass_initial}`;
		}

		nodeArray.push({
			key: index,
			text: nodeText,
			card: card,
			category: (card.id == tagID) ? 'Target' : ''	//Use the Target or
			//default category for different styling
		});
	}

	//console.log(nodeArray);

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