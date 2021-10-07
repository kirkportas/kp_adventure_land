Logger.functionEnter("Loading shared_executions");

var deathCount = 0;
var deathCheckMs = 0;
function run_shared_executions() {
	party_up();

	if (character.rip) {
		// Avoid spamming deathCount++
		if ((Date.now() - deathCheckMs) < 30000) return;
		deathCount++;
		deathCheckMs = Date.now();

		// Don't respawn after some large number of deaths.
		// Something is clearly broken, or the char is being farmed in PVP.
		if (deathCount < 10) {
			parent.socket.emit("respawn");
		}

		// Don't respawn on a PVP server.
		// if (!is_pvp()) {
		// 	Logger.log("respawning");
		// 	parent.socket.emit("respawn");
		// }
		return;
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
	for (let charname of ALLTOONS) {
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
		
		for (let itemname of itemname_arr) {
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

// Todo this has a bug in it. It will send all the gold because 
// Server latency is >200ms.


function hack_warr_send_to_mage(inv_idx) {
	if (character.name != "Terazarrior") return;
	send_item(NameMage, inv_idx);
}

var trading_last_ts = Date.now();
var trading_whitelist = ["mpot0","hpot0","mpot1","hpot1", "tracker", "elixirluck"];
// Todo add armor sets
function trading() {
	var should_run = (Date.now() - trading_last_ts) > 1000;
	if (!should_run) { return; }
	trading_last_ts = Date.now();

	let hack_warr_active = character.name == "Terazarrior" && get_player("Terakazam");
	if (character.name == NameMerchant) return;
	
	// Don't return if current is warrior, and mage is nearby
	if (!get_player(NameMerchant) && !hack_warr_active) return;

	try {
		for(let i=0;i<42;i++) {
			let item = character.items[i];
            if(item) {
				if (!trading_whitelist.includes(item.name)) {
					game_log("Sending item: "+ item.name);
					give_all_of_single_item(item.name);

					// todo HALLOWEEN FARMING HACK
					// Warrior never returns to town. 
					// Too dangerous for merchant to visit.
					hack_warr_send_to_mage(i);
				}
            }
        }

		if (character.gold > 100000) {
			game_log("character.gold: "+character.gold);
			send_gold(NameMerchant, character.gold - 90000);
		}
	} catch(err) {
		Logger.log("Err in trading");
		Logger.log(err);
	}
}

Logger.functionExit("Loading shared_executions", Date.now()-start_ts);
game_log("Finished load_code( shared_executions )");