load_code("utils_init");

// MERCHANT

// Basic loop
loop = ["goto_party", "partyget_gold", "partyget_items", "goto_town", "special_deposit_bank"];


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
	"goto": {
		"party": function() {
			// smart_move(get_leader());
			smart_move(get_entity(get_leader()));
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

setInterval(main, 1000/4); // Loops every 1/4 seconds.


 
function main(){
	load_code("shared_executions"); 
	loot();
	use_potion();

	// Todo
	if(character.rip || is_moving(character)) return;

	// if (smart.moving) {
	// 	game_log("walking");
	// 	return;
	// }

	// var current_action = get("merch_action");

	// if (current_action) {
	// 	game_log("action set");
	// 	game_log(current_action);
	// 	take_action(current_action);
	// }  else {
	// 	set("merch_action", loop[0]);
	// }
};


// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround