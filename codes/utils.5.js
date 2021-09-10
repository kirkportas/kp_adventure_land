


function get_character(name) {
	return get_characters().filter(x => x.name == name);
}

// Convenience method
function get_leader() {
	return get_character(LEADER);
}

function move_to(entity) {
	// If entity is npc:   smart_move

	smart_move(entity);
}


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

function start_chars() {
	if (character.name == LEADER) {
		for (char of SLAVES) {
			if (!(char in get_party())) {
				time_since_last_run = Date.now() - last_start_char_ts;

				if (Date.now() - time_since_last_run > 5000) {					
					start_character(char, char);
					game_log("Starting character: " + char);

					last_start_char = Date.now();
				}
			}
		}
	}
}

// http://adventure.land/docs/code/functions/send_party_invite
function party_up() {
	var is_in_party = get_party().length != undefined;

	if (character.name == LEADER) {
		
	} else {
		if (!is_in_party) {
			send_party_invite(LEADER,1); // party request
		}
	}
}
