

game_log("use_items loaded");

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