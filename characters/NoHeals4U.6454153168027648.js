// Line 1
game_log("Loading Priest char file");
load_code("utils_init");
var attack_mode=true;

setInterval(main, 1000/5); // Loops every 1/4 seconds.


const logFnName = "Main ("+character.name+")";
function main(){
	Logger.functionEnter(logFnName);
	start_ts = Date.now();

	run_shared_executions();
	use_potion(); 
	loot();
	// heal_party();
	
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
}; 
