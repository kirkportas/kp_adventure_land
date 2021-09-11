
var lastcc = 0;
init_cmd_center();
function init_cmd_center() {
	let $ = parent.$;
	let statbars = $('#bottommid');

	statbars.find('#cmd_center').remove();

	let cmd_center = $('<div id="cmd_center"></div>').css({
		fontSize: '15px',
		color: 'white',
		textAlign: 'center',
		display: 'table',
		width: "100%",
		margin: "0 auto"
	});

	let cmd_center_content = $('<div id="cmd_center_content"></div>')
		.html("<div><div id='cmd_center_fill'></div></div>")
		.css({
			display: 'table-cell',
			verticalAlign: 'middle',
			background: 'red',
			border: 'solid gray',
			borderWidth: '4px 4px 4px, 4px',
			height: '100px',
			color: 'yellow',
			textAlign: 'center',
			width: "80%",
		})
		.appendTo(cmd_center);
	statbars.children().first().after(cmd_center);

	update_cmd_center();
}



function update_cmd_center()
{
	let $ = parent.$;
	var fillAmount = ((character.cc/180)*100).toFixed(0);
	
	$("#cmd_center_fill").css({
		background: 'red',
		height: '15px',
		color: '#FFD700',
		textAlign: 'center',
		width: fillAmount + "%",
	});
}

//Clean out an pre-existing listeners
if (parent.prev_handlers_cmd_center) {
    for (let [event, handler] of parent.prev_handlers_cmd_center) {
      parent.socket.removeListener(event, handler);
    }
}

parent.prev_handlers_cmd_center = [];

//handler pattern shamelessly stolen from JourneyOver
function register_cmd_center_handler(event, handler) 
{
    parent.prev_handlers_cmd_center.push([event, handler]);
    parent.socket.on(event, handler);
};

function cmd_center_playerhandler(event){
	if(event.cc != last_cmd_cc)
	{
		update_update_cmd_center();
		last_cmd_cc = event.cc;
	}
}

register_cmd_center_handler("player", cmd_center_playerhandler);


game_log("command_center loaded!")
