/* script.js -- SENG 371 milestone-1 client-side javascript file.
	it is mostly GoJS functionality.
*/

// JQUERY FUNCTIONS ------------------
$(document).ready(function(){

	// Export button handler
	$('#export').click(function(){
			var img = $("canvas");
			toggleAdornmentLayer();
			convertCanvasToImage(img[0]);
			toggleAdornmentLayer();
		});
		
	// AJAX req to get entity and relationship data from the app server
	$.ajax({
		url: "/data",
		success: function(data, status){
			var myDiagram = genDiagram(data.node, data.link);
		},
		error: function(jqXHR, textStatus, errorThrown){
			$("#myDiagramDiv").html("<pre> could not GET /data! -- " 
			+ textStatus + ": " + errorThrown + "</pre>");
		},
		dataType: "json"
	});
});

function toggleAdornmentLayer(){
	myDiagram.startTransaction("hide Adorn");
	myDiagram.findLayer("Adornment").visible = !(myDiagram.findLayer("Adornment").visible);
	myDiagram.commitTransaction("hide Adorn");
}

function convertCanvasToImage(canvas) {
	var image = canvas.toDataURL("image/png");
	var aLink = document.createElement('a');
	var evt = document.createEvent("HTMLEvents");
	evt.initEvent("click", false, false);
	aLink.download = "picture.png";
	aLink.href = image;
	aLink.click();
}
// GOJS FUNCTIONS --------------------
// property to toggle global node expansion
var allExpanded = true;

// for conciseness in defining templates
var gmake = go.GraphObject.make;
var myDiagram = gmake(go.Diagram, 
		"myDiagramDiv",
		{
			initialDocumentSpot: go.Spot.Center,
      initialViewportSpot: go.Spot.Center,
		  initialContentAlignment: go.Spot.Center,
		  allowDelete: false,
		  allowCopy: false,
		  layout: gmake(go.CircularLayout),
		  "undoManager.isEnabled": true
		});
	
	myLoading =
        gmake(go.Part,
          { selectable: false, location: new go.Point(0, 0) },
          gmake(go.TextBlock, "loading...",
            { stroke: "red", font: "20pt sans-serif" }));
            
  myDiagram.add(myLoading);

function genDiagram(nodes, links) {	

	//additions wrapped in a transaction, so GoJS doesn't whine
	myDiagram.startTransaction('set Template');
	
	// the template for each attribute in a node's array of item data
	var itemTempl =
	  gmake(go.Panel, 
	  	"Horizontal",
	    gmake(go.Shape,
	      { 
	      	desiredSize: new go.Size(10, 10) 
	      },
      	new go.Binding("figure", "figure"),
      	new go.Binding("fill", "color")),
	    gmake(go.TextBlock,
	      { 
	      	stroke: "#333333",
	        font: "bold 14px sans-serif" 
	      },
	      new go.Binding("text", "name")
  ));

	// define the Node template, representing an entity
	myDiagram.nodeTemplate =
	  gmake(go.Node, 
	  	"Auto",  // the whole node panel
	    { 
	    	selectionAdorned: true,
	      resizable: true,
	      layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
	      fromSpot: go.Spot.AllSides,
	      toSpot: go.Spot.AllSides,
	      isShadowed: true,
	      shadowColor: "#C5C1AA" 
	    },
	    new go.Binding("location", "location").makeTwoWay(),
	    // define the node's outer shape, which will surround the Table
	    gmake(go.Shape, "Rectangle",
	      { 
	      	fill: "white", 
	      	stroke: "#756875", 
	      	strokeWidth: 3 
	      }),
    	gmake(go.Panel, 
    		"Table",
      	{ 
      		margin: 8, 
      		stretch: go.GraphObject.Fill 
      	},
      	gmake(go.RowColumnDefinition, 
      		{ 
      			row: 0, 
      			sizing: go.RowColumnDefinition.None 
      		}),
		    // the table header
		    gmake(go.TextBlock,
		      {
		        row: 0, alignment: go.Spot.Center,
		        margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
		        font: "bold 16px sans-serif"
		      },
		      new go.Binding("text", "key")),
		    // the collapse/expand button
	      gmake("PanelExpanderButton", "LIST",
	        { 
	        	row: 0, 
	        	alignment: go.Spot.TopRight 
	        }),
	      // the list of Panels, each showing an attribute
	      gmake(go.Panel, "Vertical",
	        {
	          name: "LIST",
	          row: 1,
	          padding: 3,
	          alignment: go.Spot.TopLeft,
	          defaultAlignment: go.Spot.Left,
	          stretch: go.GraphObject.Horizontal,
	          itemTemplate: itemTempl
	        },
	        new go.Binding("itemArray", "items"))
	    )  // end Table Panel
	  );  // end Node
	  
	myDiagram.nodeTemplate.contextMenu =
		gmake(go.Adornment, 
			"Vertical",
			// the button to expand nearby attributes
		  gmake("ContextMenuButton",
		  	gmake(go.TextBlock, 
		  		"Hide node"),
		  	{
		   		click: hideThisNode,
		   		alignment: go.Spot.Top,
		   		alignmentFocus: go.Spot.Bottom
		   	}),
		  gmake("ContextMenuButton",
		  	gmake(go.TextBlock, 
		  		"Show related nodes"),
		  	{
		   		click: showRelated,
		   		alignment: go.Spot.Top,
		   		alignmentFocus: go.Spot.Bottom
		   	}),
		  gmake("ContextMenuButton",
		  	gmake(go.TextBlock, 
		  		"Hide related nodes"),
		  	{
		   		click: hideRelated,
		   		alignment: go.Spot.Top,
		   		alignmentFocus: go.Spot.Bottom
		   	}
		));

	// define the Link template, representing a relationship
	myDiagram.linkTemplate =
	  gmake(go.Link,  // the whole link panel
	    {
	      selectionAdorned: true,
	      layerName: "Foreground",
	      reshapable: true,
	      routing: go.Link.AvoidsNodes,
	      corner: 5,
	      curve: go.Link.JumpOver
	    },
	    gmake(go.Shape,  // the link shape
	      { stroke: "#303B45", strokeWidth: 2.5 }),
	    gmake(go.TextBlock,  // the "from" label
	      {
	        textAlign: "center",
	        font: "bold 14pt sans-serif",
	        stroke: "#1967B3",
	        segmentIndex: 0,
	        segmentOffset: new go.Point(NaN, NaN),
	        segmentOrientation: go.Link.OrientUpright
	      },
	      new go.Binding("text", "text")),
	    gmake(go.TextBlock,  // the "to" label
	      {
	        textAlign: "center",
	        font: "bold 14px sans-serif",
	        stroke: "#1967B3",
	        segmentIndex: -1,
	        segmentOffset: new go.Point(NaN, NaN),
	        segmentOrientation: go.Link.OrientUpright
	      },
	      new go.Binding("text", "toText"))
	  );
	//VIEW CONTROL BUTTONS (NOT PART OF MODEL) ----------------------
	//show-hide all button
	myDiagram.add(
		gmake(go.Part, 
			"Auto",
			{
				layerName: "Adornment",
				_viewPosition: new go.Point(10, 10)
			},
			gmake("Button",
				{
					click: toggleAllExpanded,
				},
				gmake(go.TextBlock, 
					"Expand/collapse all", 
					{ 
						font: 'bold 14pt sans-serif',
						stroke: 'black',
						margin: 10
					}
	))));
	
	// box full o' hidden nodes
	myDiagram.add(
		gmake(go.Part, 
			"Auto",
			{
				layerName: "Adornment",
				_viewPosition: new go.Point(10, 60)
			},
			gmake("Button",
				{
					click: listHiddenNodes
				},
				gmake(go.TextBlock, 
					"Expand hidden...", 
					{ 
						font: 'bold 14pt sans-serif',
						stroke: 'black',
						margin: 10
					}
	))));
	
	// layout type selector
	myDiagram.add(
		gmake(go.Part,
			"Auto",
			{
				layerName: "Adornment",
				_viewPosition: new go.Point(10, 110)
			},
			gmake(go.Shape,
				{
					fill: "lightgray"
				}),
				gmake(go.Panel,
				"Table",
					{
						margin: 8,
						stretch: go.GraphObject.Fill
					},
					gmake(go.TextBlock,
						"Layout",
				    {
				      row: 0, 
				      alignment: go.Spot.Left,
				      margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
				      font: "bold 14pt sans-serif"
				    }),
					gmake("PanelExpanderButton", 
						"layoutList",
						{
							alignment: go.Spot.Right,
							row: 0,
						}),
					gmake(go.Panel,
					"Table",
					{
						name: "layoutList",
						row: 1,
		        padding: 3,
		        alignment: go.Spot.TopLeft,
		        defaultAlignment: go.Spot.Left,
		        stretch: go.GraphObject.Horizontal,
					},
					gmake("Button",
						gmake(go.TextBlock, "Tree"),
						{
							row: 0,
							name: 'tree',
							click: setLayout
						}),
					gmake("Button",
						gmake(go.TextBlock, "Force directed"),
						{
							row: 1,
							name: 'forceDirected',
							click: setLayout
						}),
					gmake("Button",
						gmake(go.TextBlock, "Layered digraph"),
						{
							row: 2,
							name: 'layeredDigraph',
							click: setLayout
						}),
					gmake("Button",
						gmake(go.TextBlock, "Circular"),
						{
							row: 3,
							name: 'circular',
							click: setLayout
						}),
					gmake("Button",
						gmake(go.TextBlock, "Grid"),
						{
							row: 4,
							name: 'grid',
							click: setLayout
						})					
	))));
	
	//maintain part sizes on viewport resize/zoom		
	myDiagram.addDiagramListener("ViewportBoundsChanged", function(e) {
    var dia = e.diagram;
    dia.startTransaction("fix Parts");
    
    // only iterates through simple Parts in the diagram, not Nodes or Links
    dia.parts.each(function(part) {
      // and only on those that have the "_viewPosition" property set to a Point
      if (part._viewPosition) {
        part.position = dia.transformViewToDoc(part._viewPosition);
        part.scale = 1/dia.scale;
      }
    });
    dia.commitTransaction("fix Parts");
  });
  
  myDiagram.remove(myLoading);
  //commit the template setting
  myDiagram.commitTransaction('set Template');
  
 	// finally, populate the model for the E-R diagram
	myDiagram.model = new go.GraphLinksModel(nodes, links);
	
}

// GOJS HELPER (BUTTON ONCLICK) FUNCTIONS -------------
function setLayout(e, obj){
	var dia = e.diagram;
	dia.startTransaction('set Layout');
	switch(obj.name) {
		case 'tree':
			dia.layout = gmake(go.TreeLayout);
			break;
		case 'forceDirected':
			dia.layout = gmake(go.ForceDirectedLayout);
			break;
		case 'layeredDigraph':
			dia.layout = gmake(go.LayeredDigraphLayout);
			break;
		case 'circular':
			dia.layout = gmake(go.CircularLayout);
			break;
		case 'grid':
			dia.layout = gmake(go.GridLayout);
			break;
		default:
			break;
	}
	dia.commitTransaction('set Layout');

}

function toggleAllExpanded(e, obj){
	var dia = e.diagram;
	allExpanded = !(allExpanded);
	dia.startTransaction('toggle Nodes');
	dia.nodes.each(function(node) {
		var panel = node.findObject("LIST");
		if(panel != null) panel.visible = allExpanded;
	})
	dia.commitTransaction('toggle Nodes');
}

function listHiddenNodes(e, obj){
	var dia = e.diagram;
	dia.startTransaction('list Hidden');

	if(obj.findObject("listHiddenPanel") != null){
		obj.remove(obj.findObject("listHiddenPanel"));
		dia.commitTransaction('list Hidden');
		return;
	}
	
	obj.add(
		gmake(go.Panel,
			"Vertical",
			{
				alignment: go.Spot.BottomCenter,
				alignmentFocus: go.Spot.BottomCenter,
				name: "listHiddenPanel"
			}
	));
	
	dia.nodes.each(function(node){
		if(node.visible == false){
			obj.findObject("listHiddenPanel").add(
				gmake("Button",
					{
						click: showThisNode,
						name: 'hiddenNodeButton',
						data: {'nodeKey': node.data.key}
					},
					gmake(go.TextBlock, node.data.key)
			));
		}
	});
	dia.commitTransaction('list Hidden');
}

function showThisNode(e, obj){
	var dia = e.diagram;
	dia.startTransaction('show Node'); 
	dia.findNodeForKey(obj.data.nodeKey).visible = true;
	dia.commitTransaction('show Node'); 
}

function hideThisNode(e, obj){
	var dia = e.diagram;
	dia.startTransaction('hide Node'); 
	dia.findNodeForKey(obj.part.data.key).visible = false;
	/*dia.add(
		gmake("Button",
			{
				click: showThisNode
			},
			gmake(go.TextBlock, obj.part.data.key)
		));*/
	dia.commitTransaction('hide Node'); 
}

function showRelated(e, obj){
	console.log(myDiagram.data);
	var dia = e.diagram;
	dia.startTransaction('show Related');
	var nodeKey = obj.part.data.key;
	
	//make all nodes pointed to by this one visible
	var fromLinks = dia.findLinksByExample({"from": nodeKey});
	fromLinks.each(function(link){
		dia.findNodeForKey(link.data.to).visible = true;
	});
	
	//make all nodes pointing to this one visible
	var toLinks = dia.findLinksByExample({"to": nodeKey});
	toLinks.each(function(link){
		dia.findNodeForKey(link.data.from).visible = true;
	});
	dia.commitTransaction('show Related');
}

function hideRelated(e, obj){
	var dia = e.diagram;
	dia.startTransaction('hide Related');
	var nodeKey = obj.part.data.key;
	
	//make all nodes pointed to by this one visible
	var fromLinks = dia.findLinksByExample({"from": nodeKey});
	fromLinks.each(function(link){
		dia.findNodeForKey(link.data.to).visible = false;
	});
	
	//make all nodes pointing to this one visible
	var toLinks = dia.findLinksByExample({"to": nodeKey});
	toLinks.each(function(link){
		dia.findNodeForKey(link.data.from).visible = false;
	});
	dia.commitTransaction('hide Related');
}
