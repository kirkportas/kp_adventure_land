game_log("Starting load_code(shared_executions)");
Logger.functionEnter("Loading shared_executions");


function run_shared_executions() {
	if (character.rip) {
		// Don't respawn on a PVP server.
		// If dead, party was probably attacked and killed.
		if (!is_pvp()) {
			Logger.log("respawning");
			parent.socket.emit("respawn");
		}
		// Todo reset action 
	}

	// Abort whatever's happening and retreat
	if (character.hp < character.max_hp*0.2) {
		Logger.log("Aborting and fleeing to town!");
		game_log("Aborting and fleeing to town!");
		attack_mode = false;
		use_skill("use_town");
		return;
	} else {
		if (attack_mode == false) {		
			Logger.log("Health recovering, no longer fleeing.");
			game_log("Health recovering, no longer fleeing.");
			attack_mode = true;
		}
	}

	party_up();
	// regenerate_hp_mp();

	Logger.functionEnter("trading()"); 
	try {
		trading();
	} catch(err) {
		game_log("Error in trading()");
		game_log(err);
	}
	
	Logger.functionExit("trading()", Date.now()-start_ts);

	if (character.name == LEADER) {
	// 	// kpmove("bees");
		// kpmove("crabs");
	} 

	// 	if (character.name == NameMerchant) {
	// 	}

	if (character.name == LEADER || SLAVES.includes(character.name)) {
		// kpmove("bees");
		// kpmove("crabs");
	}

	// if (character.name == NameMerchant) {
	// 	trading();
	// }
}





/*******************************************************************************
 *    No executable code below. Only helper methods.                           *
 *******************************************************************************/

function request_item_from_all(itemname) {
	for (char of ALLTOONS) {
		var key = "give_items_"+char;
		var items = get(key);
		if (!items.includes(itemname)) {
			items.push(itemname);
		}
		set(key, items);
	}
}

/*
Trading helper lines:

set("bank-"+character.name, character.bank)
show_json(get("bank-"+character.name))

// show_json(get("give_items_"+character.name))
// Logger.log("items_to_send: "+items_to_send);
// game_log('items_to_send: '+items_to_send);
*/
function trading() {

	//Trading code 
	if (character.name == NameMerchant) {
		return;
	} else {
		if (!get_player(NameMerchant)) {  
			// Logger.log("Merchant not in range ("+NameMerchant+")");
			return; 
		}
		var key = "give_items_"+character.name;
		var items_to_send = get(key);

		try {
			for (itemname of items_to_send) {
				Logger.log("Trying to send item: "+itemname);

				give_all_of_single_item(itemname);
				var item_idx = locate_item(itemname);
				if (item_idx==-1) {
					items_to_send.splice(items_to_send.indexOf(itemname), 1);
					set("give_items_"+character.name, items_to_send);
				}

				if (character.gold > 100000) {
					game_log("character.gold: "+character.gold);
					send_gold(NameMerchant,character.gold - 90000);
				}
			}
		} catch(err) {
			set(key, [])
		}
	}
}
Logger.functionExit("Loading shared_executions", Date.now()-start_ts);
game_log("Finished load_code(shared_executions)");