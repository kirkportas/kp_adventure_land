Logger.functionEnter("Loading shared_executions");


function run_shared_executions() {
	if (character.rip) {
		Logger.log("respawning");
		parent.socket.emit("respawn");
		// Todo reset action 
	}

	party_up();
	// regenerate_hp_mp();

	Logger.functionEnter("trading()"); 
	trading();
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

	TRASH = ["stinger"];
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
		
		var items_to_send = get("give_items_"+character.name);

		for (item of items_to_send) {
			Logger.log("Trying to send item: "+item);

			var result = give_all_of_single_item(item);
			var item_idx = locate_item(item);
			if (item_idx==-1) {
				items_to_send.splice(items_to_send.indexOf(item), 1);
				set("give_items_"+character.name, items_to_send);
			}

			if (character.gold > 100000) {
				game_log("character.gold: "+character.gold);
				send_gold(NameMerchant,character.gold - 90000);
			}
		}
	}
}
Logger.functionExit("Loading shared_executions", Date.now()-start_ts);