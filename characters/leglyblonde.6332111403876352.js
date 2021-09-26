// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

game_log("Loading ValMerchant char file");
var attack_mode = true; // Just for use in fleeing.
load_code("utils_init");


setInterval(function(){
	//legly blonde
	run_shared_executions();
	use_hp_or_mp();
	loot();

	//|| is_moving(character)
	if(character.rip) return;

	if (is_in_town()) {	
		//sell_all_trash();
		compound_items();
		merchant_handle_upgradeables("strscroll");
	}


},1000/4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
