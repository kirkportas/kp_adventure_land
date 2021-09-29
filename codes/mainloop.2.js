const logFnName = "Main ("+character.name+")";

var loopCount = 0;

function mainloop(){
	Logger.functionEnter(logFnName);
	start_ts = Date.now();

	run_shared_executions();
	use_potion(); 
	loot(); 

	if (attack_mode && !is_moving(character)) {
		try {
			// default_farm();	
			// default_farm("crabs");
			// stationary_farm();
			party_farm();
		} catch(err) {
			game_log("Error in mainloop for: "+character.name);
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

game_log("Finished load_code( mainloop )");