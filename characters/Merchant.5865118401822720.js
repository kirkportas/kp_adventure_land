// Line 1
game_log("Loading Merchant char file");
load_code("utils_init");


setInterval(main, 1000/2); 


function level_8_shop_upgrades() {
	var upgrade_targets_nine = ["bow"]; //"staff", "bow", "blade"];
	Logger.functionEnter("Level 8 upgrades");
	for (item of upgrade_targets_nine) {
		// send_item("Terranger", locate_item(item), 1);
		// var did_upgrade = upgrade_all_item(item, 9, "dexscroll"); // intscroll strscroll dexscroll
		did_upgrade = get_upgraded_base_item(item, 8, "strscroll"); 
		if (did_upgrade) {
			Logger.log("did_upgrade = true");
			break;
		}
	}
	Logger.functionExit("Level 8 upgrades", 0)
}

function main(){
	start_ts = Date.now();
	const logFnName = "Main ("+character.name+")";
	Logger.functionEnter(logFnName);

	run_shared_executions();
	loot();
	use_potion();

	// Todo
	if(character.rip || is_moving(character)) return;


	sell_all_trash();
	compound_items();

	var did_upgrade = false;

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
	if (!did_upgrade) {
		level_8_shop_upgrades();
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

	// // This will not work right because it doesn't track the Stat upgrade on items.
	// if (!did_upgrade) {
	// 	Logger.functionEnter("Ranger base items");
	// 	for (item of ["bow"].concat(base_armor_list)) {
	// 		// send_item("Terranger", locate_item(item), 1);
	// 		// var did_upgrade = upgrade_all_item(item, 9, "dexscroll"); // intscroll strscroll dexscroll
	// 		did_upgrade = get_upgraded_base_item(item, 9, "dexscroll"); 
	// 		if (did_upgrade) {
	// 			Logger.log("did_upgrade = true");
	// 			break;
	// 		}
	// 	}
	// 	Logger.functionExit("Ranger base items", 0);
	// }
	// if (!did_upgrade) {
	// 	Logger.functionEnter("INT base items");
	// 	for (item of ["staff"].concat(base_armor_list)) {
	// 		// send_item("Terranger", locate_item(item), 1);
	// 		// var did_upgrade = upgrade_all_item(item, 9, "dexscroll"); // intscroll strscroll dexscroll
	// 		var did_upgrade = get_upgraded_base_item(item, 9, "intscroll"); 
	// 		if (did_upgrade) {
	// 			Logger.log("did_upgrade = true");
	// 			break;
	// 		}
	// 	}
	// 	Logger.functionExit("INT base items", 0);
	// }

	// End main loop
	var runtime = Date.now()-start_ts;
	Logger.functionExit(logFnName,runtime);
	Logger.logPrintStack();
};



// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround