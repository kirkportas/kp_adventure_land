const logFnName = "Main ("+character.name+")";

var loopCount = 0;

function mainloop(){
	Logger.functionEnter(logFnName);
	start_ts = Date.now();

	run_shared_executions();
	use_potion(); 
	loot(); 

	// smart_move({"x":-24,"y":32,"map":"level2w"})
	if (attack_mode && !is_moving(character)) {
		try {
			// default_farm();	
			// default_farm("crabs");
			// stationary_farm();
			if (character.name != NameWarrior) {
				party_farm();
			} else {
				// default_farm();
				franky_farm();
			}
		} catch(err) {
			game_log("Error in mainloop for: "+character.name);
			game_log(err);
			console.log("Error in mainloop for: "+character.name);
			console.log(err);
		}
	}

	// Track executions. Maybe use this as a proxy for "ticks"
	loopCount++;

	// End main loop
	var runtime = Date.now()-start_ts;
	Logger.functionExit(logFnName,runtime);
	Logger.logPrintStack();
}

// A very frequently run attack loop. Just for triggering attacks. 
function attackloop() {
	var target=get_targeted_monster();
	if(attack_mode && is_in_range(target)) {
		set_message("Attacking");
		let result = attack(target).then(function() {
		  	// game_log("Attacked!");
		}, function(error) {
		  	// game_log("rejected");
		});
	}
}

// Less frequent execution
function cache_loop() {
	cache_inventory();
	cache_location();
}

function cache_location() {
	let key = "cache_char_location_"+character.name;
	let new_val = {
		"x": character.x,
		"y": character.y, 
		"map": character.map,
		"ts": Date.now()
	}
	set(key, new_val);
	game_log("Cached location");
}

 /*  [null,{"name": "scroll0", "q": 3 }, null, ...] */
 // todo relocate to cache file
 // show_json( get("cache_inventory_Terranger" ))
function cache_inventory() {
	let key = "cache_inventory_"+character.name;
	let cache_val = get(key); 
	if (!cache_val) { cache_val = {"items":[], "ts": 0, "esize":undefined }; }

	let new_val = {
		"items": character.items,
		"esize": character.esize, // empty slots
		"ts": Date.now()
	}

	let time_since_ms = Date.now() - cache_val.ts;
	if (cache_val.items != character.items || time_since_ms > 5000) {
		set(key, new_val);
		game_log("Cached inventory");
	} else {
		game_log("cache_inventory() called more often than it should be (5 second limit)");
	}
}

game_log("Finished load_code( mainloop )");