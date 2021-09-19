

if (!init_comms) {
	var count = 0;
	var zmax = 5;
	init_comms = true;
	game_log("Comms initted");
}
var name = character.name;

function comms() {
	if (name == NameRanger) {
		set(count, {"msg":"setByRanger","Date.now":Date.now()})

		count++;
	} 
}
// loopme(comms, 1000/4); // Loops every 1/4 seconds.


function on_cm(name,data)
{
	var is_slave = SLAVES.includes(character.name);
	var is_leader = LEADER ==  character.name;

	if(name!=NameMerchant) // Make sure to check who the CM came from
	{
		game_log("Unauthorized CM from "+name);
		return;
	}
	show_json(data);
}