// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode=true;
set_message("Start!");
game_log("Loading Warrior char file");

// game_log([1,2,3].slice(0,1));
load_code("utils_init"); 

setInterval(main, 1000/4); // Loops every 1/4 seconds.


function main(){
	Logger.functionEnter("Main ("+character.name+")");
	var start_ts = Date.now();

	Logger.functionEnter("Loading shared_executions");
	load_code("shared_executions"); // Cast Regens.. respawn
	Logger.functionExit("Loading shared_executions", 0);

	use_potion(); // use_hp_or_mp();
	loot();

	if(!attack_mode || is_moving(character)) return;
	
	// compound_items();

	set_message("Farming");
	// default_farm();	
	stationary_farm();
	// default_farm("snake");

	var runtime = Date.now()-start_ts;
	// game_log("runtime: "+runtime+"ms");
	Logger.log("Get runtime");
	Logger.functionExit("Main ("+character.name+")",runtime);
	Logger.logPrintStack();
}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
