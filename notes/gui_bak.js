let PARENT = parent;
if (!PARENT.cc_counter)
{
    PARENT.cc_counter = new PIXI.Text("0",{
        fontFamily: "Pixel",
        fontSize: 40,
        fill: "red"
    });
    PARENT.cc_counter.position.set(10, 10);
    PARENT.cc_counter.anchor.set(1, 1);
    PARENT.cc_counter.parentGroup = PARENT.cc_counter.displayGroup = PARENT.chest_layer;
    PARENT.cc_counter.zOrder = -999999999;
    PARENT.window.inner_stage ? PARENT.inner_stage.addChild(PARENT.cc_counter) : PARENT.stage.addChild(PARENT.cc_counter);
}

setInterval(function() {
    PARENT.cc_counter.text = "" + round_float(character.cc);
    PARENT.cc_counter.position.set(PARENT.width - ("com" == PARENT.inside && 5 || 335) - 35, PARENT.height - ("com" == PARENT.inside && 5 || 0));
}, 100);


^^ Example from discord

and if you wonder about the PARENT thing: parent becomes 
undefined once you stop your own code, so the setInterval callback would break

	// OG attempt 
	// let cmd_center = $('<div id="cmd_center">cmd_center</div>').css({
	// 	fontSize: '15px',
	// 	color: 'white',
	// 	background: 'green',
	// 	textAlign: 'center',
	// 	display: 'table',
	// 	width: "100%",
	// 	margin: "0 auto"
	// 	// border: "2px grey"
	// });

	// ROW 1
	// let cmd_center_content = $('<div id="cmd_center_r1"></div>')
	// 	.html("<div><div id='cmd_center_fill'>cmd_center_fill</div></div>")
	// 	.css({
	// 		display: 'table-row',
	// 		verticalAlign: 'middle',
	// 		background: 'blue',
	// 		border: 'solid gray',
	// 		borderWidth: '4px 4px 4px, 4px',
	// 		height: '100px',
	// 		color: 'yellow',
	// 		textAlign: 'center',
	// 		width: "100%",
	// 	})
	// 	.appendTo(cmd_center);

	// let cmd_center_r1_c1 = $('#r1c1')
	// 	.html("<div id='cmd_center_c1'>cmd_center_row_1</div>")
	// 	.css({
	// 		display: 'table-cell',
	// 		verticalAlign: 'middle',
	// 		background: 'red',
	// 		border: 'solid gray',
	// 		borderWidth: '4px 4px 4px, 4px',
	// 		height: '100px',
	// 		color: 'yellow',
	// 		textAlign: 'center',
	// 		width: "20%",
	// 	})
	// 	.appendTo(cmd_center_content);

	// let cmd_center_r1_c2 = $('#cmd_center_fill')
	// 	.html("<div id='cmd_center_c1'>cmd_center_row_1</div>")
	// 	.css({
	// 		display: 'table-cell',
	// 		verticalAlign: 'middle',
	// 		background: 'red',
	// 		border: 'solid gray',
	// 		borderWidth: '4px 4px 4px, 4px',
	// 		height: '100px',
	// 		color: 'yellow',
	// 		textAlign: 'center',
	// 		width: "20%",
	// 	})
	// 	.appendTo(cmd_center_content);
	
	// statbars.children().first().after(cmd_center);
	// statbars.children().first().after(table_setup);



	
	// Attempt 1
	// let table_setup = $('<div id="cmd_center"></div>').css({
	// 	fontSize: '15px',
	// 	color: 'white',
	// 	background: 'black',
	// 	textAlign: 'center',
	// 	display: 'table',
	// 	width: "100%",
	// 	margin: "0 auto",
	// 	border-collapse: collapse,
	// 	// opacity: "0.1"
	// 	// border-color: " black",
	// 	// border-width: '20px',
	// 	// padding: '20px',
	// });
	// let row1 = $('<div id="r1">r1</div>').css({
	// 	fontSize: '15px',
	// 	color: 'white',
	// 	background: 'red',
	// 	textAlign: 'center',
	// 	display: 'table-row',
	// 	width: "100%",
	// 	height: "40px",
	// 	// margin: "20px auto",
	// 	// opacity: "0.4"
	// 	border: "10px solid grey"
	// 	padding: '5px',
	// });
	// row1.appendTo(table_setup);
	// let row2 = $('<div id="r2">r2</div>').css({
	// 	fontSize: '15px',
	// 	color: 'white',
	// 	background: 'blue',
	// 	textAlign: 'center',
	// 	display: 'table-row',
	// 	width: "100%",
	// 	height: "40px",
	// 	margin: "20px auto",
	// 	// opacity: "0.4"
	// 	// border: "2px grey"
	// 	padding: '15px',
	// });
	// row2.appendTo(table_setup);







	// Attempt 3


	// Remove existing div
	// statbars.find('#cmd_center').remove();
	// var styles = "<style>";
	// styles +=  "#r1c1 { width: 40% }"
	// styles +=  "#r1c2 { width: 60% }"
	// styles +=  "#r2c1 { width: 20% }"
	// styles +=  "#r2c2 { width: 80% }"
	// styles +=  
	// styles +=  
	// styles +=  
	// styles += "</style>"

	// var layout = "";
	// layout += styles;
	// layout += '<div id="cmd_center">';
	// layout += '  <table id="cmd_table">';
	// // Row 1
	// layout += '    <tr id="r1">';
	// layout += '       <td id="r1c1">r1c1</td>';
	// layout += '       <td id="r1c2">r1c2</td>';
	// layout += '    </tr>';
	// // Row 2
	// layout += '    <tr id="r2">';
	// layout += '       <td id="r2c1">r2c1</td>';
	// layout += '       <td id="r2c2">r2c2</td>';
	// layout += '    </tr>';
	// layout += '  </table>';
	// layout += '</div>';
	// statbars.children().first().after(layout);

	// $table = $('#cmd_table');
	// $r1 = $('#r1');
	// $r1c1 = $('#r1c1');
	// $r1c2 = $('#r1c2');
	// $r2 = $('#r2');
	// $r2c1 = $('#r2c1');
	// $r2c2 = $('#r2c2');

	// $table.css({fontSize: '15px',
	// 	color: 'white',
	// 	background: 'yellow',
	// 	textAlign: 'center',
	// 	display: 'table',
	// 	width: "100%",
	// 	margin: "0 auto"
	// 	// border: "2px grey"
	// });
	// $r1.css({
	// 		// display: 'table-row',
	// 		verticalAlign: 'middle',
	// 		background: 'red',
	// 		border: 'solid gray',
	// 		"border-width": '4px 4px 4px, 4px',
	// 		height: '100px',
	// 		// color: 'yellow',
	// 		textAlign: 'center',
	// 		// width: "100%",
	// 	});
	// $r2.css({
	// 		// display: 'table-row',
	// 		verticalAlign: 'middle',
	// 		background: 'blue',
	// 		border: 'solid gray',
	// 		"border-width": '4px 4px 4px, 4px',
	// 		height: '50px',
	// 		// color: 'yellow',
	// 		textAlign: 'center',
	// 		// width: "100%",
	// 	})



=// ================


		// <div id="stylewrapper">
		// 	<style>
		// 		#wrapper {
		// 		   display: grid;
		// 		   grid-template-columns: repeat(3, 1fr);
		// 		   grid-template-rows: repeat(3, 40px);
		// 		   background: black;
		// 		   color: black;
		// 		   font-size: "40px";
		// 		   textAlign: 'center';

		// 		   vertical-align: middle;
		// 		   z-index: 1;
		// 		}
		// 		.box1 {
		// 		   grid-column: 1 ;
		// 		   grid-row: 1 / 4;
		// 		   background: green;
		// 		   font-size: "40px";
		// 		}
		// 		.box2 {
		// 		   grid-column: 2 ;
		// 		   grid-row: 1 / 3;
		// 		   background: white;
		// 		}
		// 		.box3 {
		// 		   grid-column: 3 ;
		// 		   grid-row: 1 ;
		// 		   background: yellow;
		// 		   color: white;
		// 		}
		// 		.box4 {
		// 		   grid-column: 2 / 4;
		// 		   grid-row: 3 ;
		// 		   background: blue;
		// 		   color: red;
		// 		}
		// 	</style>
		// </div>

