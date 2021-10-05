// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode=true;

load_code("utils_unit");
load_code("pattack");
load_code("val_utils");

function use_potion() {
	if(is_on_cooldown("use_hp")) return;

	if(character.mp<character.max_mp*0.3) {  
		game_log("use_mp()");
		use_skill('use_mp'); 
	} else if(character.hp/character.max_hp<0.7) {
		use_skill('use_hp'); 
	// Regen counts as an item use.
	// /!is_on_cooldown("regen_hp") && 
	} else if(character.hp/character.max_hp<0.9) {
		use_skill('regen_hp'); 
	} else if(character.mp / character.max_mp < 0.7) {
		use_skill('use_mp'); 

	// Regen MP if no potion is used and HP is not regenned
	} else { //if(!is_on_cooldown("regen_mp"))
		if (character.mp < character.max_mp){
			use_skill('regen_mp');	
		} else if (character.hp < character.max_hp) {
			use_skill('regen_hp');	
		} else {
			// Do nothing to avoid item cooldown time
		}
	} 
}


setInterval(function(){

	use_potion();
	loot();

	if(!attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster({min_xp:100,max_att:120});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!is_in_range(target))
	{
		smart_move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}

},1000/4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
