// Line 1
game_log("Loading Priest char file");

var attack_mode=true;

var FPS_TESTING = false;
if (!FPS_TESTING) {
	game_log("NOT FPS testing");
	load_code("utils_init");
	setInterval(main, 1000/4); // Loops every 1/4 seconds.
} else {
	game_log("FPS testing");
	try { load_code("use_items"); } 	    catch(err) { Logger.log("Error loading use_items: "+err); }
	setInterval(default_main, 1000/4); // Loops every 1/4 seconds.
}

// FPS Testing only
function default_main(){
	use_potion();
	if(!attack_mode || character.rip || is_moving(character)) return;
	var target=get_targeted_monster();
	if(!target) {
		target=get_nearest_monster({min_xp:100,max_att:120});
		if(target) { change_target(target); }
		else { set_message("No Monsters"); return; }
	}
	if(!is_in_range(target)) { 
		move(character.x+(target.x-character.x)/2,character.y+(target.y-character.y)/2); 
	} else if(can_attack(target)) {
		set_message("Attacking");
		attack(target);
	}
}

function main(){
	start_ts = Date.now();
	Logger.functionEnter("Main ("+character.name+")");
	run_shared_executions();

	use_potion(); // use_hp_or_mp();
	loot();
	
	if(!attack_mode || is_moving(character)) return;

	// default_farm();	
	// stationary_farm();
	// party_farm();
	default_farm("crabs");


	// End main loop
	var runtime = Date.now()-start_ts;
	Logger.functionExit("Main ("+character.name+")",runtime);
	Logger.logPrintStack();
}; 

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
