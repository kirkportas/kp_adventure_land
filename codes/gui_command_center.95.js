

init_cmd_center();

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
				<div id="cmd_followme" class="enableclicks">
					 FOLLOW
				</div>
			</div>
			<div class="box3">
				<div id="cmd_three" class="enableclicks">
					 StopChars
				</div>
			</div>
			<div class="box4">
				<div id="cmd_four" class="enableclicks">
					 GiveItems
				</div>
			</div>
			<div class="box5">
				<div id="cmd_five" class="enableclicks">
					 Upgrade
				</div>
			</div>
			<div class="box6">
				<div id="cmd_six" class="enableclicks">
					 Compound
				</div>
			</div>
		</div>
		`;
	
	// <div id="test">test</div>
	// $('head').append(style_toggle);
	// statbars.children().first().after(style_toggle);

	// Insert the grid HTML above the lower-middle game HTML UI
	statbars.children().first().after(gridlayout);

	var $wrapper = $('#wrapper');
	var $header = $wrapper.find('.cmd_header');
	var $box2 = $wrapper.find('.box2');
	var $box3 = $wrapper.find('.box3');
	var $box4 = $wrapper.find('.box4');
	var $box5 = $wrapper.find('.box5');
	var $box6 = $wrapper.find('.box6');

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
		'grid-column': '2',
		'grid-row': '3',
		'background': 'blue',
	});
	$box5.css({
		'grid-column': '3',
		'grid-row': '2',
		'background': 'white',
	});
	$box6.css({
		'grid-column': '3',
		'grid-row': '3',
		'background': 'green',
	});

	var $btn_followme = $('#cmd_followme');
	$btn_followme.click(toggle_follow);
	render_follow_btn();

	var $btn_cmd_three = $('#cmd_three');
	$btn_cmd_three.click(stop_chars);
	render_grey_btn($btn_cmd_three);

	var $btn_cmd_four = $('#cmd_four');
	$btn_cmd_four.click(give_items_wip);
	render_grey_btn($btn_cmd_four);

	var $btn_cmd_five = $('#cmd_five');
	$btn_cmd_five.click(gui_upgrade);
	render_grey_btn($btn_cmd_five);

	var $btn_cmd_six = $('#cmd_six');
	$btn_cmd_six.click(gui_compound);
	render_grey_btn($btn_cmd_six);


	// update_cmd_center();

	// $test = $('#test');
	// $test.css({
	// 	'background': 'orange',
	// });
}


// This adds an itemname to a localstorage Key
// Each key is specific to fighter character names.
// The fighter will attempt to give those items if the Merchant is in range.
// When a fighter has no more, the key will be removed from their "give queue"
function give_items_wip() {
	game_log("give_items_wip()");
	var all_to_get = COMPOUNDABLE.concat(TRASH, FARMABLE, UPGRADEABLE);
	for (item of all_to_get) {
		request_item_from_all(item);
	}
}


// Follow button toggling is broken
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
	// $test = $('#test');
	// $test.css({
	// 		'background': 'orange',
	// });
}

function gui_compound(elem) {
	compound_items();
}
function gui_upgrade(elem) {
	upgrade_items();
}

function stop_chars(elem) {
	let $ = parent.$;
	var $btn = $('#cmd_followme');

	game_log('Stopping characters');
	stop_character(NameRanger);
	stop_character(NamePriest);
}

function render_follow_btn() {
	let $ = parent.$;
	var $btn = $('#cmd_followme');

	// Light when not active. Dark when active
	if (!follow) {
		render_grey_btn($btn);
	} else {
		$btn.css({
			'border-radius': '12px',
			background: 'grey',
		});
	}
}

var count = 0;

function gui_active_btn(elem) {
		$elem.css({
			'border-radius': '12px',
			'background': 'grey',
			'-webkit-box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'-moz-box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'outline': 'none',
		}); 
}
function render_grey_btn($elem) {
		$elem.css({
			'border-radius': '12px',
			'background': '#e5e5e5',
			'-webkit-box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'-moz-box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'box-shadow': 'inset 0px 0px 5px #c1c1c1',
			'outline': 'none',
		}); 
}

//Clean out an pre-existing listeners
if (parent.prev_handlers_cmd_center) {
    for (let [event, handler] of parent.prev_handlers_cmd_center) {
      parent.socket.removeListener(event, handler);
    }
}

game_log("Finished load_code( gui_command_center )");


var style_test = `
	<style> 
		#test: {background: black; color: white;}
	</style>`;
