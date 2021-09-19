

// Basic loop
const GOTO_PARTY = "goto_party";
const GOTO_BANK = "goto_bank"; 


// merch_action_loop = {
// 	1: 'teleport to town',
// 	2: 'dump all items in bank',
// 	3: 'collect all compoundables',
// 	4: 'collect all upgradeables',
// 	5: 'perform compounds',
// 	6: 'perform upgrades'
// 	7: 'Dump items in bank'
// }

const action_map = {
	"teleport": function() { 
		use_skill("use_town"); 
	},
	"goto": {
		"party": function() {
			smart_move(get_entity(get_leader()));
		},
		"bank": function() { 
			smart_move("bank"); 
		},
	},
	"deposit_items": function() {
		if (!(character.in == "bank")) {
			action_map["goto"]["bank"]();
		}
	}
}

// Split an action into parts. "goto_party" => [goto][party]
function take_action(action) {
	game_log("action: "+action);
	var action = action.split("_");
	var primary = action[0], secondary = action[1];
	game_log("Primary: "+primary);
	game_log("Secondary: "+secondary);
	action_map[primary][secondary]();
}



const items = ["hpbelt","hpamulet"];


// Loop 2:  login. Teleport

// State Handling
var current_action = get("merchant_action");
if (!current_action) {
	current_action = "teleport";
	set("merchant_action", "teleport");
}

loop = ["teleport",
		"goto_bank", 
		"deposit_items",
		"goto_party",
		// Check for compoundables
		// Check for upgradeables 
		// "partyget_gold", 
		"partyget_items", ];


// compound_items();

// take_action(current_action);

// var current_action_idx = loop.indexOf(current_action) +1;
// if (current_action_idx >= loop.length) {
// 	current_action_idx = 0;
// }
// current_action = loop[current_action_idx];


// if (character.esize < 30) {
// 	take_action("goto_bank")
// 	if (!(character.in == "bank")) {
// 		smart_move("bank");
// 	} else {
// 		for (var item of items) {
// 			var idx = locate_item(item);
// 			game_log("item: "+item+", idx: "+idx);
// 			bank_store(idx);
// 		}
// 	}
// } else {
// 	kpmove("bees");
// }
// if (smart.moving) {
// 	return;
// }

// var current_action = get("merch_action");
// if (current_action) {
// 	take_action(current_action);
// }  else {
// 	set("merch_action", loop[0]);
// }
