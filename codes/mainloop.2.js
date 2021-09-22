const logFnName = "Main ("+character.name+")";
function mainloop(){
	Logger.functionEnter(logFnName);
	start_ts = Date.now();

	run_shared_executions();
	use_potion(); 
	loot();

	if (attack_mode && !is_moving(character)) {
		// default_farm();	
		// default_farm("crabs");
		// stationary_farm();
		party_farm();
	}

	// End main loop
	var runtime = Date.now()-start_ts;
	Logger.functionExit(logFnName,runtime);
	Logger.logPrintStack();
}