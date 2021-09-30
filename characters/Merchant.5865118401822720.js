// Line 1
game_log("Loading Merchant char file");
load_code("utils_init", function(){ game_log("Error loading utils_init"); });

var attack_mode = true; // Just for use in fleeing.
setInterval(main, 1000/2); 
pontyPurchase();
joinGiveAways();
setInterval(pontyPurchase, 15000);
setInterval(joinGiveAways, 29000);

// Stores event names only 
track_events();

add_top_button("showPonty","showPonty", showPontyBuyList);

// Use this to make do any custom or one-off stuff.
function custom_town_behavior() {

	// 1) Early-game: Get some/all shop items to lvl 9
	// if (character.gold > 1000000 && !did_upgrade) {
	// 	// level_x_shop_upgrades(8);
	// }

	// 2) 
	// var base_armor_list = ["helmet","shoes","gloves","pants","coat"];
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
}

function main(){
	start_ts = Date.now();
	Logger.functionEnter(logFnName);

	try {

		run_shared_executions();
		loot();
		use_potion();

		// Todo
		 // || is_moving(character)   // Dont stop merchant actions if moving
		if(character.rip) {
			Logger.functionExit(logFnName, 0);
			return;
		}

		if (is_in_town()) {	
			sell_all_trash();
			compound_items();
			buy_potions();


			// Upgrade "common" items to a specified level (e.g. 7)
			merchant_handle_upgradeables("dexscroll");

			// For one-off actions
			custom_town_behavior();
		}

		// Store items in "items1", the 2nd from right in southern row. (Gabriella)
		if (is_in_bank()) {
			bank_store_craftables()
		}

		// Cast Mluck if not cast, or <58 minutes remaining
		for (let char of ALLTOONS) {
			var entity = parent.entities[char];
			if (!entity) return;

			if (is_in_range(entity) && entity.s) {
		        if (!("mluck" in entity.s) || entity.s.mluck.ms < 58*60*1000) {
					game_log("use_skill mluck: "+char)
					use_skill("mluck",entity);
				}
			}
			if (is_in_range(entity)) {
				// give_potions(entity);
			}
		}

	} catch(err) {
		game_log("Error in merchant main loop");
		Logger.log("Error in merchant main loop");

	} finally {
		// End main loop
		var runtime = Date.now()-start_ts;
		Logger.functionExit(logFnName,runtime);
		Logger.logPrintStack();
	}
};

function buy_potions() {
	let mpot0_count = get_item_count_in_inventory("mpot0");
	let hpot0_count = get_item_count_in_inventory("hpot0");

	if (mpot0_count < 9999) { buy("mpot0", 9999-mpot0_count); }
	if (hpot0_count < 9999) { buy("hpot0", 9999-hpot0_count); }
}

// function give_potions(entity) {
// 	let char_inv_cache = get("cache_inventory_"+entity.name);
// 	if (!char_inv_cache) { 
// 		game_log("Error reading inventorycache for "+entity.name); 
// 		return;
// 	}
// 	if (mssince(char_inv_cache.ts) > 15000) { 
// 		game_log("Error: inventorycache out of date for "+entity.name+" by "+mssince(char_inv_cache.ts/1000)+"s"); 
// 		return;
// 	}

// 	// todo generalize getcount to accept a character.items object
// 	let mpot0_count = char_inv_cache.items.filter(item => item.);
// 	let hpot0_count = get_item_count_in_inventory("hpot0");

// 	if (mpot0_count < 9999) { buy("mpot0", 9999-mpot0_count); }
// 	if (hpot0_count < 9999) { buy("hpot0", 9999-hpot0_count); }
// }

function bank_store_craftables() {
	for (itemname of ["gem0", "spidersilk"]) {
		let itemidx = locate_item(itemname);
		if (itemidx >= 0) {
			bank_store(itemidx, "items1");
		}
	}	
	for (itemname of LOW_CRAFT_ITEMS) {
		let itemidx = locate_item(itemname);
		if (itemidx >= 0) {
			bank_store(itemidx, "items1");
		}
	}
}

function check_for_compoundable_trios() {
	if (!is_in_bank()) {
		game_log("Cannot scan bank")
	}
	for (itemname of LOW_CRAFT_ITEMS) {
		let itemidx = locate_item(itemname);
		if (itemidx >= 0) {
			bank_store(itemidx, "items1");
		}
	}
}

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround