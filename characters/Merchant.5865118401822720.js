// Line 1
game_log("Loading Merchant char file");
load_code("utils_init");


setInterval(main, 1000); 



function main(){
	start_ts = Date.now();
	Logger.functionEnter("Main ("+character.name+")");

	run_shared_executions();
	loot();
	use_potion();

	// Todo
	if(character.rip || is_moving(character)) return;

	for (item of ["helmet","shoes","gloves","pants","coat"]) {
		// send_item("Terranger", locate_item(item), 1);
		var did_upgrade = get_upgraded_base_item(item, 7, "dexscroll"); // intscroll strscroll
		if (did_upgrade) {
			break;
		}
	}

	// End main loop
	var runtime = Date.now()-start_ts;
	Logger.functionExit("Main ("+character.name+")",runtime);
	Logger.logPrintStack();
};



// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround