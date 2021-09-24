


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

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

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
			for (char of ACTIVE_PARTY) {
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

var partyup_last_ts = Date.now();
function party_up() {
	// Only run once per 2 seconds
	var should_run = (Date.now() - partyup_last_ts) > 2000;
	if (!should_run) { return; }
	partyup_last_ts = Date.now();

	// Logger.log("Checking party_up");
	var is_in_party = get_party().length != undefined || character.name in get_party();

	if (character.name == LEADER) {
		
	} else {
		if (!is_in_party) {
			game_log("party_up SEND_REQUEST");
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
	let item_idxs = locate_items(item);
	for (idx of item_idxs) {
		let item = character.items[idx];
		let quantity = item.q ? item.q : 1;
		send_item(NameMerchant, idx, quantity);
		return true;
	} 
	
	// var item_idx = locate_item(item);
	// if(item_idx >= 0) {
	// 	var item = character.items[item_idx];
	// 	var quantity = item.q ? item.q : 1;
	// 	send_item(NameMerchant, item_idx, quantity);
	// 	return true;
	// } else {
	// 	return false;
	// }
}

	// Grade 0 => scroll0
	// Grade 1 => scrol 1
	// "grades": [7, 9, 10, 12 ],
function get_item_grade(item) {
	var gitemgrades = G.items[item.name].grades;

	Logger.log("get_item_grade(). grades="+gitemgrades.toString());
	// in not of 
	for (i in gitemgrades) {
		if (item.level < gitemgrades[i]) {
			return i;
		}
	}
}
// game_log(get_item_grade(locate_item(2)))
// game_log(locate_item(2))


// const SCROLLS_BY_ITEM_GRADE = ["scroll0", "scroll1", "scroll2"];
// const grade = item_grade(item);
// const scroll_name = SCROLLS_BY_ITEM_GRADE[grade];
// const slot_scroll = locate_item(scroll_name);