

game_log("Loading use_items (3)");

function use_potion() {
	if(is_on_cooldown("use_hp")) return;

	if(character.mp<200) {
		use_skill('use_mp'); 
	} else if(character.hp/character.max_hp<0.7) {
		use_skill('use_hp'); 
	// Regen counts as an item use.
	} else if(!is_on_cooldown("regen_hp") && character.hp/character.max_hp<0.9) {
		use_skill('regen_hp'); 
	} else if(character.mp / character.max_mp < 0.7) {
		use_skill('use_mp'); 

	// Regen MP if no potion is used and HP is not regenned
	} else if(!is_on_cooldown("regen_mp")) {
		if (character.mp < character.max_mp){
			use_skill('regen_mp');	
		} else if (character.hp < character.max_hp) {
			use_skill('regen_hp');	
		} else {
			// Do nothing to avoid item cooldown time
		}
	} 
}