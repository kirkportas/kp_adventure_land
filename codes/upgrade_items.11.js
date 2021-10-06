

function merchant_handle_upgradeables(scrolltype) {
	if (character.q.upgrade) return;  // Skip if already upgrading

	Logger.functionEnter("handle UPGRADEABLE_LEVELS");
	let did_upgrade = false;
	for (var [item, maxlvl] of Object.entries(UPGRADEABLE_LEVELS)) {
		// no dex for ranger items
		// if (["wgloves","wcap"].includes(item)) {
		// 	scrolltype = "intscroll";
		// }
		did_upgrade = upgrade_all_item(item, maxlvl, scrolltype); // "dexscroll" intscroll strscroll
		if (did_upgrade) {
			Logger.log("did_upgrade = true");
			break;
		}
	}
	Logger.functionExit("handle UPGRADEABLE_LEVELS", 0);
}

// Will compound all whitelisted items to their maxlvl - defined in utils_init 
function compound_items(){
	if (character.q.compound) { return; }
	// for (var [item, maxlvl] of Object.entries(COMPOUNDABLE_LEVELS)) {
	for (item of COMPOUNDABLE) {

		let lvl = 0;
		for (; lvl < max_level_compound; lvl++) {
			var item_idxs = locate_items_of_level(item, lvl);
			var count = item_idxs.length;
			if (count >= 3) {

				var grade = item_grade(character.items[item_idxs[0]]); 
				if (grade == 0) {
					scrollname = "cscroll0";
				} else if(grade ==1) {
					scrollname = "cscroll1";
				} else if(grade >= 2){
					Logger.log("compound_item called for grade 2+. NOT SUPPORTED");
					Logger.log(`name: ${item}`);
					return;
				} else {
					Logger.log("unknown grade value: "+grade.toString());
					Logger.log(`name: ${item}`);
					return;
				}

				var scroll_idx = locate_item(scrollname);
				if (scroll_idx < 0) {
					buy(scrollname, 5);
				}

				game_log(item);
				game_log(item_idxs);

				// var result = parent.socket.emit('compound', {
				// 	item_idxs.slice(0,3);
				// });

				// builtin method 
				use_skill("massproduction");
				compound(item_idxs[0],item_idxs[1],item_idxs[2],scroll_idx);
				// game_log("result: "+result);
			}
		}
	}
}

// Will upgrade all whitelisted items to their maxlvl - defined in utils_init 
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
				// game_log(item);
				// game_log(item_idxs);
				use_skill("massproduction");
				upgrade(item_idxs[0],scroll_idx);
			}
		}
	}
}

// This helper will restock and upgrade shop items to desired level.
// Manually modify the 8 to 7 or 9 as needed.
function level_x_shop_upgrades(lvl) {
	var upgrade_targets = ["bow"]; //"staff", "bow", "blade"];
	Logger.functionEnter(`Level ${lvl} upgrades`);
	for (item of upgrade_targets) {
		// intscroll strscroll dexscroll
		let did_upgrade = get_upgraded_base_item(item, lvl, "strscroll"); 
		if (did_upgrade) {
			Logger.log("did_upgrade = true");
			break;
		}
	}
	Logger.functionExit(`Level ${lvl} upgrades`, 0)
}

var allowed_past_7 = ["bow","blade","staff","helmet","shoes","gloves","pants","coat"];
function upgrade_item(item_idx){
	if (character.q.upgrade) { return; }

	var item = character.items[item_idx];

	var scrollname = "";
	var grade = get_item_grade(item); 
	if (grade == 0) {
		scrollname = "scroll0";
	} else if(grade ==1) {
		scrollname = "scroll1";
	} else if(grade >= 2){
		Logger.log("upgrade_item called for grade 2+. NOT SUPPORTED");
		Logger.log(`idx: ${item_idx}, name: ${item.name}`);
		return;
	} else {
		Logger.log("unknown grade value: "+grade.toString());
		Logger.log(`idx: ${item_idx}, name: ${item.name}`);
		return;
	}

	var scroll_idx = locate_item(scrollname);
	if (scroll_idx < 0) {
		Logger.log("Buying a: "+scrollname);
		buy(scrollname, 5);
	}
	// Only upgrade shop items 
	if (item.level >=7 && !allowed_past_7.includes(item.name)) {
		Logger.log("WILL NOT UPGRADE A LVL 7 ITEM.");
		return false;
	}
	Logger.log("Upgrading a: "+character.items[item_idx].name);
	use_skill("massproduction");
	upgrade(item_idx,scroll_idx);
	return true;
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
		Logger.log("WILL NOT STAT-UPGRADE A LVL 7+ ITEM.");
		return false;
	}
	Logger.log("Stat-upgrading a: "+character.items[item_idx].name);
	upgrade(item_idx, scroll_idx);
	return true;
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
			var item = character.items[upgradeable_item_idx];
			Logger.log(`Item (${itemname}) level (${item.level})`);

			var is_statupgradeable = "stat" in G.items[itemname];
			var is_statupgraded = "stat_type" in item;

			if (item.level == 6 && is_statupgradeable && !is_statupgraded) {
				// Apply stat scroll
				set_message("StatUpgrade");
				Logger.log("ShopItem Stat upgrade at level: "+item.level);
				return upgrade_item_stat(upgradeable_item_idx, stat_type);
			} else {
				set_message("ItemUpgrade");
				return upgrade_item(upgradeable_item_idx);
			}
		}
		return true;
	} else {
		Logger.log("SUCCESS- upgraded: "+itemname+" lvl "+target_lvl);
		return false;
	}

}

function get_upgraded_nonbase_item(itemname, target_lvl, stat_type) {
	if (character.q.upgrade) { return; }

	var have_item = locate_items_at_or_above_level(itemname, target_lvl).length >= 1;

	if (!have_item) {
		var upgradeable_item_idx = locate_item_below_level(itemname, target_lvl);
		if (upgradeable_item_idx == -1) {
			Logger.log("No item available: "+itemname);
			return false;
		} else {
			// Todo replace with call to upgrade_all_item()
			var item = character.items[upgradeable_item_idx];
			Logger.log(`Item (${itemname}) level (${item.level})`);

			var is_statupgradeable = "stat" in G.items[itemname];
			var is_statupgraded = "stat_type" in item;

			let next_level_ups_grade = G.items[item.name].grades[item_grade(item)+1] > item.level+1
			
			if (item_grade(item) == 0 && is_statupgradeable && !is_statupgraded
				&& next_level_ups_grade) {
				// Apply stat scroll
				set_message("StatUpgrade");
				Logger.log("Nonbase Stat upgrade at level: "+item.level);
				return upgrade_item_stat(upgradeable_item_idx, stat_type);
			} else {
				set_message("ItemUpgrade");
				return upgrade_item(upgradeable_item_idx);
			}
			game_log("SHOULD NOT REACH HERE");
			return false;
		}
	} else {
		Logger.log("SUCCESS- upgraded: "+itemname+" lvl "+target_lvl);
		return false;
	}

}

function upgrade_all_item(itemname, target_lvl, stat_type) {
	if (character.q.upgrade) { return false; }

	var upgradeable_item_idx = locate_item_below_level(itemname, target_lvl);
	if (upgradeable_item_idx == -1) {
		// Logger.log("No item available: "+itemname);
		return false;
	} else {
		var item = character.items[upgradeable_item_idx];
		if (item.level >= target_lvl) {
			return false;
		}
		Logger.log(`Item (${itemname}) level (${item.level})`);

		var is_statupgradeable = "stat" in G.items[itemname];
		var is_statupgraded = "stat_type" in item;

		if (item_grade(item) == 0 && is_statupgradeable && !is_statupgraded) {
			// Apply stat scroll
			set_message("StatUpgrade");
			Logger.log("upgrade_all Stat upgrade at level: "+item.level);
			upgrade_item_stat(upgradeable_item_idx, stat_type);
		} else {
			set_message("ItemUpgrade");
			upgrade_item(upgradeable_item_idx);
		}
		return true;
	}

}


game_log("Finished load_code( upgrade_items )");
