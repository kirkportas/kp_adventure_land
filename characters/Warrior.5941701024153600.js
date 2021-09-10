// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode=true;
set_message("HELLO!");
game_log("Loading Warrior char file");

load_code("init"); 

setInterval(function(){

	use_potion(); // use_hp_or_mp();
	load_code("shared_executions"); // Cast Regens..
	loot();

	if(!attack_mode || character.rip || is_moving(character)) return;

	// default_farm();	
	// stationary_farm();

	party_farm();


},1000/6); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
