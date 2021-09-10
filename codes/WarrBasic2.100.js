// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode=true
//var attack_mode=false

setInterval(function(){

	use_hp_or_mp_2();
	loot();

	if(!attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		//target=get_nearest_monster({min_xp:100,max_att:120});
		target=get_nearest_monster({min_xp:400,max_att:60});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!is_in_range(target))
	{
		move(
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

},1000/12); // Loops every 1/5 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround

function use_hp_or_mp_2()
{
	if(safeties && mssince(last_potion)<min(200,character.ping*3)) return;
	var used=true;
	if(is_on_cooldown("use_hp")) return;
	if(character.mp<50) use_skill('use_mp'); 
	//if(character.mp/character.max_mp<0.2) use_skill('use_mp'); 
	else if(character.hp/character.max_hp<0.9) use_skill('use_hp');
	//else if(character.mp/character.max_mp<0.5) use_skill('use_mp');
	//else if(character.hp<character.max_hp) use_skill('use_hp');
	//else if(character.mp<character.max_mp) use_skill('use_mp');
	else used=false;
	if(used) last_potion=new Date();
}