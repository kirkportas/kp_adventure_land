// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode=true;
set_message("Start!");
game_log("Loading Warrior char file");

load_code("utils_init"); 

setInterval(main, 1000/4); // Loops every 1/4 seconds.







function main(){
	var time = Date.now();
	load_code("shared_executions"); // Cast Regens.. respawn
	use_potion(); // use_hp_or_mp();
	loot();

	if(!attack_mode || is_moving(character)) return;
	

	// default_farm();	
	stationary_farm();
	// default_farm("snake");

	var runtime = Date.now()-time;
	// game_log("runtime: "+runtime+"ms");
}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
