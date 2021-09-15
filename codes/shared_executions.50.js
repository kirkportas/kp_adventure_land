

// Logger.log("Running shared_executions");
if (character.rip) {
	Logger.log("respawning");
	parent.socket.emit("respawn");
	// Todo reset action 
}

party_up();

// regenerate_hp_mp();


TRASH = ["stinger"];
// if (character.name == NameMerchant) {
// 	trading();
// }
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

//// set("bank-"+character.name, character.bank)
// show_json(get("bank-"+character.name))

trading();
function trading() {
	//Tradeing code 
	if (character.name == NameMerchant) {
		// Logger.log("Trading() not running for merchant");
		return;
	} else {
		// if (!NameMerchant in get_party()) { return; }
		if (!get_player(NameMerchant)) { 
			// Logger.log("Merchant not in range ("+NameMerchant+")");
			return; 
		}
	
		var items_to_send = get("give_items_"+character.name);
		// Logger.log("items_to_send: "+items_to_send);

		for (item of items_to_send) {
			Logger.log("Trying to send item: "+item);
			// game_log("Trying to send item: xxx");
			var result = give_all_of_single_item(item);
			var item_idx = locate_item(item);
			if (item_idx==-1) {
				items_to_send.splice(items_to_send.indexOf(item), 1);
				set("give_items_"+character.name, items_to_send);
			}

			if (character.gold > 100000) {
				send_gold(NameMerchant,character.gold - 90000);
			}
			// give_all_of_single_item("hpbelt");
			// give_all_of_single_item("hpamulet");
			// give_all_of_single_item("ringsj");
		}
		// if (items_to_send) {
		// 	Logger.log("Trying to send item: "+item_to_send);
		// 	// game_log("Trying to send item: xxx");
		// 	give_all_of_single_item(item_to_send);

		// }

		// give_all_of_single_item("scroll0");
	}

}
if (character.name == LEADER) {
	kpmove("bees");

	if (character.name != NameMerchant) {

	}
} 

if (SLAVES.includes(character.name)) {
	kpmove("bees");

	// items_to_give = 
	// Check for a "send to merchant command"
	// var items_to_give = 
}