

// if (!init_comms) {
// 	var count = 0;
// 	var zmax = 5;
// 	init_comms = true;
// 	game_log("Comms initted");
// }

// loopme(comms, 1000/4); // Loops every 1/4 seconds.
function comms() {
	if (name == NameRanger) {
		set(count, {"msg":"setByRanger","Date.now":Date.now()})

		count++;
	} 
}

/* Currently this just prints the CM. No actions taken */
function on_cm(name,data)
{
	if(!ALLTOONS.includes(name) && name != "kouin") // Make sure to check who the CM came from
	{
		game_log("Begin Unauthorized CM from "+name);
		print_cm_data(data);
		game_log("End Unauthorized CM from "+name);
		return;
	}
	game_log("CM from "+name);
	game_log(data);

	if (data.constructor == Object) {
		let cmlog_i = 0;
		for (var [k, v] of Object.entries(data)) {
			game_log(`{ ${k}: ${v} }`);
			cmlog_i++;
			if (cmlog_i > 100) break;
		}
	}
}

// Todo check if stringify/parse is needed here.
function print_cm_data(data) {
	// Data can be a {} or a string
	let cmlog_i = 0;
	if (data.constructor == Object) {
		for (var [k, v] of Object.entries(data)) {
			game_log(`{ ${k}: ${v} }`);
			cmlog_i++;
			if (cmlog_i > 100) break;
		}
	} else {
		game_log(`data: ${data}`);
	}
}

game_log("Finished load_code( comms )");