


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
			var party = get_party();
			for (char of SLAVES) {
				if (!(char in party)) {
					start_character(char, char);
					game_log("Starting character: " + char);
					Logger.log("Starting character: " + char);
				}
			}
			last_start_char_ts = Date.now();
		}
	}
}

// http://adventure.land/docs/code/functions/send_party_invite

function party_up() {
	// Only run once per 2 seconds
	var should_run = (Date.now() - get(TIMESTAMP_KEY)) > 2000;
	if (!should_run) { return; }

	// Logger.log("Checking party_up");
	var is_in_party = get_party().length != undefined || character.name in get_party();

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

function locate_items(name) {
	idxs = [];
	for(var i=0;i<42;i++) {
		if(character.items[i] 
			&& character.items[i].name==name) {
			idxs.push(i);
		}
	}
	return idxs;
}
function locate_items_of_level(name, level) {
	idxs = [];
	for(var i=0;i<42;i++) {
		if(character.items[i] 
			&& character.items[i].name==name
			&& character.items[i].level==level) {
			idxs.push(i);
		}
	}
	return idxs;
}
function locate_items_below_level(name, level) {
	idxs = [];
	for(var i=0;i<42;i++) {
		if(character.items[i] 
			&& character.items[i].name==name
			&& character.items[i].level<level) {
			idxs.push(i);
		}
	}
	return idxs;
}
function locate_item_below_level(name, level) {
	// Return first found slot of an item at given level
	var slots = locate_items_below_level(name,level);
	if (slots.length) {
		return slots[0];
	} else {
		return -1;
	}
}
function locate_items_at_or_above_level(name, level) {
	idxs = [];
	for(var i=0;i<42;i++) {
		if(character.items[i] 
			&& character.items[i].name==name
			&& character.items[i].level>=level) {
			idxs.push(i);
		}
	}
	return idxs;
}
function locate_bank_items(name) {
	//todo expand for more bank packs
	var bankpacks = ["items0","items1"];
	var itemlocs = {'items0':[], 'items1':[]};

	for (pack of bankpacks) {
		for(var i=0;i<42;i++) {
			if(character.bank[pack][i] 
				&& character.bank[pack][i].name==name) {
				itemlocs[pack].push(i);
			}
		}
	}
	return itemlocs;
}
/*
var itemlocs = locate_bank_items("stinger");
for (pack of Object.keys(itemlocs)) {
	for (idx of itemlocs[pack]) {
		bank_retrieve(pack, idx);
	}
}
*/
function sell_all_trash(){
	const TRASH = ["stinger"];

    character.items.forEach((item, index) => {
        if (item
            && TRASH.includes(item.name)
            && item_grade(item) < 2) {
            log(`Merchant is unloading trash ${item.name}`);
            item.q ? sell(index, item.q) : sell(index, item);
        }
    });
}

// 	{
// 	"items0": [
// 		1,2
// 	],
// 	"items1": [
// 		21,23
// 	]
// }

// function locate_item(name) {
// 	for(var i=0;i<42;i++) {
// 		if(character.items[i] && character.items[i].name==name) return i;
// 	}
// 	return -1;
// }

// .q is broken
// function get_item_quantity(item) {
// 	idx = locate_item(item);
// 	return character.items[idx].q
// }

function give_all_of_single_item(item) {
	// number_of_items = get_item_quantity(item);
	var item_idx = locate_item(item);
	if(item_idx > 0) {
		send_item(NameMerchant, locate_item(item), 1);
		return true;
	} else {
		return false;
	}
}

function compound_items(){
	if (character.q.compound) { return; }
	for (item of COMPOUNDABLE) {

		let lvl = 0;
		for (; lvl <= max_level_compound; lvl++) {
			var scroll_idx = locate_item("cscroll0");
			if (scroll_idx < 0) {
				buy("cscroll0",5);
			}
			var item_idxs = locate_items_of_level(item, lvl);
			var count = item_idxs.length;
			if (count >= 3) {
				game_log(item);
				game_log(item_idxs);

				// var result = parent.socket.emit('compound', {
				// 	item_idxs.slice(0,3);
				// });

				// builtin method 
				compound(item_idxs[0],item_idxs[1],item_idxs[2],scroll_idx);
				// game_log("result: "+result);
			}
		}
	}
}

function upgrade_items(){
	if (character.q.upgrade) { return; }
	for (item of UPGRADEABLE) {

		let lvl = 0;
		for (; lvl < max_level_upgrade; lvl++) {
			var scroll_idx = locate_item("scroll0");
			if (scroll_idx < 0) {
				buy("scroll0",5);
			}
			var item_idxs = locate_items_of_level(item, lvl);
			var count = item_idxs.length;
			if (count >= 1) {
				game_log(item);
				game_log(item_idxs);

				// var result = parent.socket.emit('compound', {
				// 	item_idxs.slice(0,3);
				// });

				// builtin method 
				upgrade(item_idxs[0],scroll_idx);
				// game_log("result: "+result);
			}
		}
	}
}

function upgrade_item(item_idx){
	if (character.q.upgrade) { return; }

	var scroll_idx = locate_item("scroll0");
	if (scroll_idx < 0) {
		Logger.log("Buying a: scroll0");
		buy("scroll0",5);
	}

	if (character.items[item_idx].level >=7) {
		Logger.log("WILL NOT UPGRADE A LVL 7 ITEM.");
		return;
	}
	Logger.log("Upgrading a: "+character.items[item_idx].name);
	upgrade(item_idx,scroll_idx);
}

function upgrade_item_stat(item_idx, stat_type) {
	// strscroll intscroll dexscroll 
	if (character.q.upgrade) { return; }

	var scroll_idx = locate_item(stat_type);
	if (scroll_idx < 0) {
		Logger.log("Buying a: "+ stat_type);
		buy(stat_type,1);
	}

	if (character.items[item_idx].level >=7) {
		Logger.log("WILL NOT StAT-UPGRADE A LVL 7+ ITEM.");
		return;
	}
	Logger.log("Stat-upgrading a: "+character.items[item_idx].name);
	upgrade(item_idx, scroll_idx);
} 

// Early game helper method.
// Only intended for merchant use in first gear-up of fighter toons. 
function get_upgraded_base_item(itemname, target_lvl, stat_type) {
	if (character.q.upgrade) { return; }

	var have_item = locate_items_at_or_above_level(itemname, target_lvl).length >= 1;

	if (!have_item) {
		var upgradeable_item_idx = locate_item_below_level(itemname, target_lvl);
		if (upgradeable_item_idx == -1) {
			buy(itemname);
			Logger.log("0 base items available. Buying - "+itemname);
		} else {
			var item = character.items[upgradeable_item_idx].level;
			if (item.level == 6) {
				// Apply stat scroll
				set_message("StatUpgrade");
				var is_statupgradeable = "stat" in G.items[itemname];
				var is_statupgraded = "stat_type" in item;
				if (is_statupgradeable && !is_statupgraded) {
					upgrade_item_stat(upgradeable_item_idx, stat_type);
				}
			} else {
				set_message("ItemUpgrade");
				upgrade_item(upgradeable_item_idx);
			}
		}
		return true;
	} else {
		Logger.log("SUCCESS- upgraded: "+itemname+" lvl "+target_lvl);
		return false;
	}

}

// const SCROLLS_BY_ITEM_GRADE = ["scroll0", "scroll1", "scroll2"];
// const grade = item_grade(item);
// const scroll_name = SCROLLS_BY_ITEM_GRADE[grade];
// const slot_scroll = locate_item(scroll_name);