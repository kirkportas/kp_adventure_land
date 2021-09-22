

game_log("upgrade_items loading");

function check_upgrade() {
	if(safeties && mssince(last_potion)<min(200,character.ping*3)) return;

	var used=true;
	if(is_on_cooldown("use_hp")) return;

	if(character.mp<50) use_skill('use_mp'); 
	else if(character.hp/character.max_hp<0.8) use_skill('use_hp');


	//if(character.mp/character.max_mp<0.2) use_skill('use_mp'); 
	//else if(character.mp/character.max_mp<0.5) use_skill('use_mp');
	//else if(character.hp<character.max_hp) use_skill('use_hp');
	//else if(character.mp<character.max_mp) use_skill('use_mp');


	else used=false;
	if(used) last_potion=new Date();
}
function upgrade_item() {
}


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
