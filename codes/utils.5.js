


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
	if (!last_start_char_ts) {
		var last_start_char_ts = Date.now()-15001;
	}
	if (character.name == LEADER) {
		game_log(Date.now() - last_start_char_ts);
		if (Date.now() - last_start_char_ts > 15000) {	
			for (char of SLAVES) {
				if (!(char in get_party())) {
					start_character(char, char);
					game_log("Starting character: " + char);
				}
			}
			last_start_char_ts = Date.now();
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

// https://discord.com/channels/238332476743745536/243707345887166465/750783323965751417
// For finding targets or HP of another character
// function get_parent(name, is_master) {
function get_parent(name) {
    if (character.name == LEADER) {
        return parent.parent;
    } else {
        const char_iframe = parent.parent.$("#ichar"+name.toLowerCase())[0];
        if (char_iframe) {
        	game_log("found char_iframe");
            return char_iframe.contentWindow;
        } else {
    		game_log("did not find char_iframe");
    	}
    }
}