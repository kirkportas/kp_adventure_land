
class CommandCenter {
  constructor() {
    this.height = 1;
  }

  // Getter
  get init() {
    return this.calcArea();
  }

  // Method
  calcArea() {
    return this.height * this.width;
  }
}



init_cmd_center();
setInterval(update_cmd_center, 1000/2);

let $ = parent.$;

function init_cmd_center() {
	let $ = parent.$;
	// Anchor to a pre-existing "bottom" div
	// This div contains the ATT, INV, HP, and MP bars
	let statbars = $('#bottommid');

	// Remove existing div
	statbars.find('#wrapper').remove();
	$('#style_toggle').remove();
	// statbars.find('#stylewrapper').remove();

	gridlayout = style_test;
	gridlayout += `
		<div id="wrapper" class="enableclicks">
			<div class="cmd_header">Command Center</div>
			<div class="box2">
				<div id="cmd_followme" 
					class="enableclicks" 
					onclick="toggle_follow(this)">
					 FOLLOW
				</div>
			</div>
			<div class="box3">Three</div>
			<div class="box4">Four</div>
		</div>
		`;
	
	// <div id="test">test</div>
	// $('head').append(style_toggle);
	// statbars.children().first().after(style_toggle);
	statbars.children().first().after(gridlayout);

	var $wrapper = $('#wrapper');
	var $header = $wrapper.find('.cmd_header');
	var $box2 = $wrapper.find('.box2');
	var $box3 = $wrapper.find('.box3');
	var $box4 = $wrapper.find('.box4');

	// Note that 
	// "grid-template-columns": 'repeat(3, 1fr)',  // GOOD
	// "grid-template-columns": 'repeat(3, "1fr")', // BAD
	$wrapper.css({
		'display': "grid",
		'color': "black",
		'textAlign': 'center',

		"font-size": "30px",
		"grid-template-columns": 'repeat(3, 1fr)',
		"grid-template-rows": '20% 40% 40%',
		// "grid-template-rows": 'repeat(3, 50px)',
		"vertical-align": 'middle',
		"z-index": 1,

		'background': "grey",
		// 'background-color': '#3e2723',
		'padding': '5px',
		'border-radius': '5px',
	});

	$('[class^="box"').css({
	  'padding': '20px',
	});

	$header.css({
		'grid-column': '1 / 4',
		'grid-row': '1',
		'background': 'green',
	});
	$box2.css({
		'grid-column': '1',
		'grid-row': '2 / 4',
		'background': 'red',
	});
	$box3.css({
		'grid-column': '2',
		'grid-row': '2',
		'background': 'yellow',
	});
	$box4.css({
		'grid-column': '3',
		'grid-row': '3',
		'background': 'blue',
	});

	var $btn_followme = $('#cmd_followme');
	$btn_followme.click(toggle_follow);
	render_follow_btn();


    // const styleElement = parent.document.createElement("style");
    // styleElement.id = "testcss";
    // // styleElement.className = "css-ai";
    // if (styleElement.styleSheet) {
    //   styleElement.styleSheet = style_toggle;
    // } else {
    //   styleElement.appendChild(parent.document.createTextNode(style_toggle));
    // }
    // parent.document.getElementsByTagName("head")[0].appendChild(styleElement);

	// update_cmd_center();

	$test = $('#test');
	$test.css({
		'background': 'orange',
	});
}

var follow = false;
function toggle_follow(elem) {
	let $ = parent.$;
	var $btn = $('#cmd_followme');
	game_log('toggle_follow()');

	// follow = !follow;
	if (follow){
		follow = false;
		game_log('set to false');
	} else {
		follow = true;	
		game_log('set to true');
	}

	render_follow_btn();
	$test = $('#test');
	$test.css({
			'background': 'orange',
	});
}
function render_follow_btn() {
	let $ = parent.$;
	var $btn = $('#cmd_followme');
	game_log(follow);

	// Light when not active. Dark when active
	if (!follow) {
		$btn.css({
			'border-radius': '12px',
			'background': '#e5e5e5',
			'-webkit-box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'-moz-box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'outline': 'none',
		}); 
	} else {
		$btn.css({
			'border-radius': '12px',
			background: 'grey',
		});
	}
}

var count = 0;
function update_cmd_center()
{
	let $ = parent.$;
	
	$(".box4").html("count: "+count);
	count++;
	// game_log('table update: ' +count);
	// render_follow_btn();
}


//Clean out an pre-existing listeners
if (parent.prev_handlers_cmd_center) {
    for (let [event, handler] of parent.prev_handlers_cmd_center) {
      parent.socket.removeListener(event, handler);
    }
}


game_log("command_center loaded!")



var style_test = `
	<style> 
		#test: {background: black; color: white;}
	</style>`;
// <label class="switch switch-left-right">
// 	<input class="switch-input" type="checkbox" />
// 	<span class="switch-label" data-on="On" data-off="Off"></span> 
// 	<span class="switch-handle"></span> 
// </label>

// var style_toggle = `
// <style type="text/css id="style_toggle">

// #test {
// 	background: white;
// 	font-size: 2px;
// }
// /* Switch Left Right
// ==========================*/
// .switch-left-right .switch-label {
// 	overflow: hidden;
// }
// .switch-left-right .switch-label:before, .switch-left-right .switch-label:after {
// 	width: 20px;
// 	height: 20px;
// 	top: 4px;
// 	left: 0;
// 	right: 0;
// 	bottom: 0;
// 	padding: 11px 0 0 0;
// 	text-indent: -12px;
// 	border-radius: 20px;
// 	box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.2), inset 0 0 3px rgba(0, 0, 0, 0.1);
// }
// .switch-left-right .switch-label:before {
// 	background: #eceeef;
// 	text-align: left;
// 	padding-left: 80px;
// }
// .switch-left-right .switch-label:after {
// 	text-align: left;
// 	text-indent: 9px;
// 	background: #FF7F50;
// 	left: -100px;
// 	opacity: 1;
// 	width: 100%;
// }
// .switch-left-right .switch-input:checked ~ .switch-label:before {
// 	opacity: 1;
// 	left: 100px;
// }
// .switch-left-right .switch-input:checked ~ .switch-label:after {
// 	left: 0;
// }
// .switch-left-right .switch-input:checked ~ .switch-label {
// 	background: inherit;
// }
// </style>
// `;