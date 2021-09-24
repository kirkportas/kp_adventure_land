// Line 1
game_log("Loading Merchant char file");
load_code("utils_init", function(){ game_log("Error loading utils_init"); });

var attack_mode = true; // Just for use in fleeing.
setInterval(main, 1000/2); 
setInterval(pontyPurchase, 15000);
setInterval(joinGiveAways, 29000);

function main(){
	start_ts = Date.now();
	Logger.functionEnter(logFnName);

	run_shared_executions();
	loot();
	use_potion();

	// Todo
	if(character.rip || is_moving(character)) {
		Logger.functionExit(logFnName, 0);
		return;
	}

	var did_upgrade = false;
	if (is_in_town()) {	
		sell_all_trash();
		compound_items();


		// Upgrade "common" items to a specified level
		Logger.functionEnter("handle UPGRADEABLE_LEVELS");
		for (var [item, maxlvl] of Object.entries(UPGRADEABLE_LEVELS)) {
			// send_item("Terranger", locate_item(item), 1);
			did_upgrade = upgrade_all_item(item, maxlvl, "dexscroll"); // intscroll strscroll
			if (did_upgrade) {
				Logger.log("did_upgrade = true");
				break;
			}
		}
		Logger.functionExit("handle UPGRADEABLE_LEVELS", 0);

		// Early-game: Get some/all shop items to lvl 9
		if (character.gold > 1000000 && !did_upgrade) {
			// level_x_shop_upgrades(8);
		}
	}
	// Store items in "items1", the 2nd from right in southern row. (Gabriella)
	if (character.in == "bank") {
		for (itemname of LOW_CRAFT_ITEMS) {
			let itemidx = locate_item(itemname);
			if (itemidx >= 0) {
				bank_store(itemidx, "items1");
			}
		}
	}
	
	var base_armor_list = ["helmet","shoes","gloves","pants","coat"];
	// if (!did_upgrade) {
	// 	Logger.functionEnter("Warrior base items");
	// 	for (item of ["blade","wshield"].concat(base_armor_list)) {
	// 		// send_item("Terranger", locate_item(item), 1);
	// 		// var did_upgrade = upgrade_all_item(item, 9, "dexscroll"); // intscroll strscroll dexscroll
	// 		did_upgrade = get_upgraded_base_item(item, 7, "strscroll"); 
	// 		if (did_upgrade) {
	// 			Logger.log("did_upgrade = true");
	// 			break;
	// 		}
	// 	}
	// 	Logger.functionExit("Warrior base items", 0);
	// }

	// Cast Mluck if not cast, or <58 minutes remaining
	for (let char of ALLTOONS) {
		var entity = parent.entities[char];
		if (entity && is_in_range(entity) && entity.s) {
	        if (!("mluck" in entity.s) || entity.s.mluck.ms < 58*60*1000) {
				game_log("use_skill mluck: "+char)
				use_skill("mluck",entity);
			}
		}
	}
	// End main loop
	var runtime = Date.now()-start_ts;
	Logger.functionExit(logFnName,runtime);
	Logger.logPrintStack();
};



// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround