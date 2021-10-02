Logger.functionEnter("Loading shared_executions");

function run_shared_executions() {
	party_up();

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
		// Recover from the "abort mode"
		if (attack_mode == false) {		
			Logger.log("Health recovering, no longer fleeing.");
			game_log("Health recovering, no longer fleeing.");
			attack_mode = true;
		}
	}

	Logger.functionEnter("trading()"); 
	try { 
		trading(); 
	}  catch(err) {
		game_log("Error in trading()");
		game_log(err);
	}
	Logger.functionExit("trading()", Date.now()-start_ts);
}




/*******************************************************************************
 *    No executable code below. Only helper methods.                           *
 *******************************************************************************/



// This had issues and became spotty on Sept25. It worked fine before that
// Would only push the first item (hpamulet)
function request_item_from_all(itemname) {
	for (charname of ALLTOONS) {
		// Ignore offline or faroff characters
		if (!get_entity(charname)) continue;
		// game_log("request_item_from_all() - "+charname);

		let key = "give_items_"+charname;
		var items = get(key);
		if (!items.includes(itemname)) {
			items.push(itemname);
		}
		set(key, items);
	}
}

function request_items_from_all(itemname_arr) {
	for (charname of ALLTOONS) {
		// Ignore offline or faroff characters
		if (!get_entity(charname)) continue;

		let key = "give_items_"+charname;
		game_log("Requesting items from "+charname);
		game_log("Key: "+key);
		var items = get(key);
		if (!items) items = [];
		
		for (itemname of itemname_arr) {
			if (!items.includes(itemname)) {
				items.push(itemname);
			}
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
// function debounce(func, timeout = 500){
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => { func.apply(this, args); }, timeout);
//   };
// }

// function trading() {
// 	game_log("TRADING ts: "+Date.now());
// 	return debounce(trading, 500);
// }

// Todo this has a bug in it. It will send all the gold because 
// Server latency is >200ms.





// Only run once per 2 seconds
var trading_last_ts = Date.now();
function trading() {
	var should_run = (Date.now() - trading_last_ts) > 1000;
	if (!should_run) { return; }
	trading_last_ts = Date.now();

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

				var item_idx = locate_item(itemname);
				give_all_of_single_item(itemname);
				if (item_idx==-1) {
					items_to_send.splice(items_to_send.indexOf(itemname), 1);
					set("give_items_"+character.name, items_to_send);
					game_log("removing item from sendlist: "+ itemname);
				} else {

					game_log("Sending item: "+ itemname);
					give_all_of_single_item(itemname);
				}
				/* This should work but doesn't
				let item_idx = locate_item(itemname);

				if (item_idx==-1) {
					items_to_send.splice(items_to_send.indexOf(itemname), 1);
					set("give_items_"+character.name, items_to_send);
				} else {
					give_all_of_single_item(itemname);
					break;
				}
				*/
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
game_log("Finished load_code( shared_executions )");