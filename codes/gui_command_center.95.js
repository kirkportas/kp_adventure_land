

init_cmd_center();
setInterval(update_cmd_center, 1000/2);

function init_cmd_center() {
	let $ = parent.$;
	// Anchor to a pre-existing "bottom" div
	// This div contains the ATT, INV, HP, and MP bars
	let statbars = $('#bottommid');

	// Remove existing div
	statbars.find('#wrapper').remove();
	// statbars.find('#stylewrapper').remove();

	gridlayout = `
		<div id="wrapper" class="enableclicks">
			<div class="box1">11111</div>
			<div class="box2">Two</div>
			<div class="box3">Three</div>
			<div class="box4">Four</div>
		</div>
		`;
	statbars.children().first().after(gridlayout);

	var $wrapper = $('#wrapper');
	var $box1 = $wrapper.find('.box1');
	var $box2 = $wrapper.find('.box2');
	var $box3 = $wrapper.find('.box3');
	var $box4 = $wrapper.find('.box4');

	// Note that 
	// "grid-template-columns": 'repeat(3, 1fr)',  // GOOD
	// "grid-template-columns": 'repeat(3, "1fr")', // BAD
	$wrapper.css({
		display: "grid",
		background: "black",
		color: "black",
		textAlign: 'center',

		"font-size": "40px",
		"grid-template-columns": 'repeat(3, 1fr)',
		"grid-template-rows": '10% 45% 45%',
		// "grid-template-rows": 'repeat(3, 50px)',
		"vertical-align": 'middle',
		"z-index": 1,
	});

	$box1.css({
		'grid-column': '1',
		'grid-row': '1 / 4',
		'background': 'green',
		'font-size': "40px",
	});
	$box2.css({
		'grid-column': '2',
		'grid-row': '1 / 2',
		'background': 'red',
		'font-size': "40px",
	});
	$box3.css({
		'grid-column': '3',
		'grid-row': '1',
		'background': 'yellow',
		'font-size': "40px",
	});
	$box4.css({
		'grid-column': '2 / 4',
		'grid-row': '3',
		'background': 'blue',
		'font-size': "40px",
	});
	// update_cmd_center();
}


var count = 0;
function update_cmd_center()
{
	let $ = parent.$;
	
	$(".box4").html("count: "+count);
	count++;
	// game_log('table update: ' +count);
}


// var count = 0;
// function update_cmd_center()
// {
// 	let $ = parent.$;
	
// 	$("#r2c2").html("count: "+count);
// 	count++;
// }

//Clean out an pre-existing listeners
if (parent.prev_handlers_cmd_center) {
    for (let [event, handler] of parent.prev_handlers_cmd_center) {
      parent.socket.removeListener(event, handler);
    }
}


game_log("command_center loaded!")
