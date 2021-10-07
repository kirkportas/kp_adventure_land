// Line 1
game_log("Loading Merchant char file");
load_code("utils_init", function(){ game_log("Error loading utils_init"); });

var attack_mode = true; // Just for use in fleeing.
setInterval(main, 1000/2); 
setInterval(scareLoop, 1000/3); 
pontyPurchase();
joinGiveAways();


// Location based - 0-time actions 
setInterval(pontyPurchase, 15000);
setInterval(joinGiveAways, 29000);

// Time-costly actions/missions
setInterval(serverLoop, 5*60*1000); // 5 minutes
// setInterval(collectItems, 12*60*1000); // 15 minutes

// Stores event names only 
track_events();

add_top_button("showPonty","showPonty", showPontyBuyList);
add_top_button("eventTypes","eventTypes", () => { show_json(get("stats_game_events_dict").actions_custom) });


function scareLoop() {
	let nearest_mon = get_nearest_monster();
	if (!nearest_mon) return;
	if (distance(character, nearest_mon) < 50) {
		use_skill("scare");
	}
}

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


var servers = [["ASIA","I"],["US","I"],["US","II"],["US","III"],["US","PVP"],["EU","I"],["EU","II"],["EU","PVP"]];
servers.push(["US","PVP"]); // Todo, doubled up on us pvp for now
const SERVER_I_KEY = "server_i"; 
var server_i = get(SERVER_I_KEY) || 0;
function serverLoop() {
	if (!is_in_town()) { return; }

	server_i++;
	if (server_i > servers.length-1) { server_i = 0 };
	set(SERVER_I_KEY, server_i);

	let region = servers[server_i][0];
	let name = servers[server_i][1];
	game_log("Changing servers!");
	change_server(region, name); // change_server("EU","I") ("ASIA","PVP") or ("US","III")
}




let missionControl = new MissionControl();
missionControl.init(); 
game_log("missionControl.q: " + missionControl.q);
missionControl.run_missions();
// setInterval(missionControl.run_missions.bind(missionControl), 1000);

add_top_button("showMissions","showMissions", showMissions);
function showMissions() {
	show_json(missionControl.q);
}


add_top_button("M-C-Terranger","M-C-Terranger", addCollectMission);
function addCollectMission() {
	missionControl.addMission(new CollectItemsMission("Terranger"));
}

add_top_button("M-Compound","M-Compound", function() {
	let m = new HandleCompoundablesMission();
	missionControl.addMission(m);
});


function main(){
	start_ts = Date.now();
	Logger.functionEnter(logFnName);

	try {
		run_shared_executions();
		loot();
		use_potion();


		//  Unequip to walk faster 
		if (is_moving(character)) { 
			if (character.slots["mainhand"] != null) {
				unequip("mainhand"); 	
			}
			close_booth();
		}

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

		// smart_move( G.npcs["exchange"].id )

		// Cast Mluck if not cast, or <58 minutes remaining
		for (let charObj of onlineChars()) {
			let charName = charObj.name;
			var entity = parent.entities[charName];
			if (!entity) return;

			if (is_in_range(entity, "mluck") && entity.s) {
		        if (!("mluck" in entity.s) || entity.s.mluck.ms < 58*60*1000) {
					game_log("use_skill mluck: "+charName)
					use_skill("mluck",entity);
				}
			}
			// todo find distance for sending items
			if (distance(character, entity) < 300) {
				give_potions(entity);
			}
		}

	} catch(err) {
		game_log("Error in merchant main loop");
		game_log(err);
		Logger.log("Error in merchant main loop");
		Logger.log(err);

	} finally {
		// End main loop
		var runtime = Date.now()-start_ts;
		Logger.functionExit(logFnName,runtime);
		Logger.logPrintStack();
	}
};

var buy_potion_ts = Date.now();
function buy_potions() {
	if (Date.now() - buy_potion_ts < 3000) { return; }
	buy_potion_ts = Date.now();

	let mpot0_count = get_item_count_in_inventory("mpot0");
	let hpot0_count = get_item_count_in_inventory("hpot0");
	let target = 9999*2; // 2 stacks
	// Avoid latency issues and overbuying
	if (mpot0_count < target) { buy("mpot0", Math.max(1,(target-mpot0_count)/3)); }
	if (hpot0_count < target) { buy("hpot0", Math.max(1,(target-hpot0_count)/3)); }
}


// function give_item(charname, itemname, count) {
// 	// assumes in range and item present.

// }

var give_potion_ts = {}; 
function give_potions(entity) {
	if (!give_potion_ts[entity]) give_potion_ts[entity] = 0;
	if (Date.now() - give_potion_ts[entity] < 3000) { return; }
	give_potion_ts[entity] = Date.now();

	// let hpot = "hpot0";
	// let mpot = "mpot1";

	let charObj = entity;
	let charname = entity.name;
	let inv_cache_key = "cache_inventory_"+charname;
	let char_inv_cache = get(inv_cache_key);
	if (!char_inv_cache) { 
		game_log("Error reading inventorycache for "+charname); 
		return;
	}
	let cache_age_ms = Date.now() - char_inv_cache.ts;
	if (cache_age_ms > 15000) { 

		game_log("Error: inventorycache out of date for "+entity.name+" by "+(cache_age_ms/1000)+"s"); 
		return;
	}
	if (distance(character, entity) > 300) {
		game_log("Give potions out of range: " +charObj.name);
		return;
	}
	// Todo Check if merchant has potions in inventory.
	// Todo this will oversend. because it does not update the cached inv count

	// Fill them up to a full stack of 9999 potions
	let mpot0_count = get_item_count_in_inventory_array(char_inv_cache.items, "mpot0");
	if (mpot0_count < 9999) { 
		send_item(charname, locate_item("mpot0"), 9999-mpot0_count); 
		// game_log(`Sent ${9999-mpot0_count} mpot0's to ${charname}`);
	}

	let hpot0_count = get_item_count_in_inventory_array(char_inv_cache.items, "hpot0");
	if (hpot0_count < 9999) { 
		send_item(charname, locate_item("hpot0"), 9999-hpot0_count); 
		// game_log(`Sent ${9999-mpot0_count} hpot0's to ${charname}`);
	}
}

function bank_store_craftables() {
	for (let itemname of ["spidersilk","rattail","bfur","gemfragment"]) {
		let itemidx = locate_item(itemname);
		if (itemidx >= 0) {
			organized_bank_store(itemidx);
		}
	}	
	for (let itemname of LOW_CRAFT_ITEMS) {
		let itemidx = locate_item(itemname);
		if (itemidx >= 0) {
			organized_bank_store(itemidx);
		}
	}
}

function check_for_compoundable_trios() {
	if (!is_in_bank()) {
		game_log("Cannot scan bank")
	}
	for (let itemname of LOW_CRAFT_ITEMS) {
		let itemidx = locate_item(itemname);
		if (itemidx >= 0) {
			organized_bank_store(itemidx);
		}
	}
}

function open_booth() {
    parent.socket.emit("merchant",{num:0})
}

function close_booth() {
    parent.socket.emit("merchant",{close:1})
}