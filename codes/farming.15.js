

game_log("Loading farming (15)");

function default_farm() {
	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster({min_xp:900,max_att:70});
		//target=get_nearest_monster({min_xp:1000,max_att:30,path_check:true});
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
}

function stationary_farm() {
	// game_log("Stationary_farming");
	var target=get_targeted_monster();
	if(!target || !is_in_range(target))
	{
		target=get_nearest_monster({min_xp:200,max_att:70});
		//target=get_nearest_monster({min_xp:1000,max_att:30,path_check:true});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}
}

function party_farm() {
	// default_farm();	
	stationary_farm();
}
