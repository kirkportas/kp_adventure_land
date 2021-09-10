

// game_log("Loading shared_executions (50)");

// regenerate_hp_mp();


function regenerate_hp_mp() {
	// Regen counts as an item use.
	if(!is_on_cooldown("regen_hp") && character.hp/character.max_hp<0.8) {
		game_log('regenned hp');
		use_skill('regen_hp'); 

	// Regen MP if no potion isused and HP is not regenned
	} else if(!is_on_cooldown("regen_mp")) {
		game_log('regenned mp');
		use_skill('regen_mp'); 
	} 
}

