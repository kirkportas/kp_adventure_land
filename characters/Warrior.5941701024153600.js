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
	load_code("shared_executions"); // Cast Regens..
	// load_code("gui_minimap");
	// load_code("gui_render_party");
	// load_code("gui_codecost");

	use_potion(); // use_hp_or_mp();
	loot();

	if(!attack_mode || character.rip || is_moving(character)) return;

	// default_farm();	
	stationary_farm();
	// default_farm("snake");

}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
