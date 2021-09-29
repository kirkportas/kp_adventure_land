

// if (!init_comms) {
// 	var count = 0;
// 	var zmax = 5;
// 	init_comms = true;
// 	game_log("Comms initted");
// }
// var name = character.name;

function comms() {
	if (name == NameRanger) {
		set(count, {"msg":"setByRanger","Date.now":Date.now()})

		count++;
	} 
}
// loopme(comms, 1000/4); // Loops every 1/4 seconds.


function on_cm(name,data)
{
	// var is_slave = SLAVES.includes(character.name);
	// var is_leader = LEADER == character.name;

	if(!ALLTOONS.includes(name) && name != "kouin") // Make sure to check who the CM came from
	{
		game_log("Unauthorized CM from "+name);
		return;
	}
	game_log("CM from "+name);
	game_log(data);

	if (data.constructor == Object) {
		let cmlog_i = 0;
		for (var [k, v] of Object.entries(data)) {
			game_log(`{ ${k}: ${v} }`);
			cmlog_i++;
			if (cmlog_i > 200) break;
		}
	}
}
game_log("Finished load_code( comms )");