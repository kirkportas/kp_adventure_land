

game_log("Loading use_items (3)");

function use_potion() {
	// if(safeties && mssince(last_potion)<min(200,character.ping*3)) return;

	// var used=true;
	if(is_on_cooldown("use_hp")) return;

	if(character.mp<200) {
		use_skill('use_mp'); 
		// game_log("Used Magic Potion"); 
	} else if(character.hp/character.max_hp<0.7) {
		use_skill('use_hp'); 
		// game_log("Used Health Potion"); 
	// Regen counts as an item use.
	} else if(!is_on_cooldown("regen_hp") && character.hp/character.max_hp<0.9) {
		use_skill('regen_hp'); 
		// game_log('regenned hp');
	// Regen MP if no potion isused and HP is not regenned
	} else if(!is_on_cooldown("regen_mp")) {
		if (character.mp < character.max_mp){
			use_skill('regen_mp');	
		} else if (character.hp < character.max_hp) {
			use_skill('regen_hp');	
		} else {
			// Do nothing to avoid item cooldown time
		}
		// game_log('regenned mp');
	} 

	//if(character.mp/character.max_mp<0.2) use_skill('use_mp'); 
	//else if(character.mp/character.max_mp<0.5) use_skill('use_mp');
	//else if(character.hp<character.max_hp) use_skill('use_hp');
	//else if(character.mp<character.max_mp) use_skill('use_mp');


	// else used=false;
	// if(used) last_potion=new Date();
}