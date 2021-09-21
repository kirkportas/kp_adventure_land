

game_log("Loading farming (15)");

var name_map = {
	'crabs': 'crab',
};

// Abort farm mission if attack_mode is disabled.
// This is used for a town-retreat when the script fails
// future use will be upon a battle loss 
function should_abort() {
	return !attack_mode;
}

function default_farm(mon_type) {
	if (should_abort()) { return; }

	// Disabled for Bats
	// if (mon_type) {
	// 	kpmove(mon_type);
	// }
	// Set plurals to single. e.g. "crabs" -> "crab"
	if (mon_type in name_map) {
		mon_type = name_map[mon_type];
	}
	var target=get_targeted_monster();
	if(!target)
	{
		if (mon_type) {
			target=get_nearest_monster({min_xp:100,max_att:100, type:mon_type});
		} else {
			target=get_nearest_monster({min_xp:100,max_att:100});
		}
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
	if (should_abort()) { return; }
	
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

function support_leader() {
	if (should_abort()) { return; }

	if (!is_moving(character)) {
		move_to_leader();
	}

	// show_json(get_entity("Terranger").target)
	// show_json(get_entity(get_entity("Terranger").target))
	// var ranger_target = get_entity("Terranger").target;
	// game_log(ranger_target);
	// change_target(ranger_target)
	// show_json(get_entity(get_entity("Terranger").target))

	// The key:
	// change_target(parent.entities[ranger_target])

	var target=get_targeted_monster();
	if (!target && "target" in get_entity(LEADER)) {
		var leader_target_id = get_entity(LEADER).target;
		var mob_obj = parent.entities[leader_target_id];

		if(mob_obj) {
			// game_log(mob_obj.target);
			// Logger.log("Changing target to leader target");
			if ("target" in mob_obj && mob_obj.target == LEADER) {
				change_target(mob_obj);
			}
		} else {
			// Logger.log("Can't target leader target");
			set_message("Can't target");
			return;
		}
	}
	target=get_targeted_monster();
		
	// if(!is_in_range(target))
	// {
	// 	// Walk half the distance
	// 	move(character.x+(target.x-character.x)/2,
	// 		character.y+(target.y-character.y)/2 );
	// }
	
	if(can_attack(target)) {
		set_message("Attacking");
		attack(target);
	} else {
		// Leader has no target
	}
}
/*
maps:
"main", "cave"
*/


// function party_farm() {
// 	if (should_abort()) { return; }

// 	// default_farm();
// 	kpmove("bees");
// 	stationary_farm();
// }

function party_farm() {
	if (should_abort()) { return; }

	// default_farm();
	// kpmove("bees");
	// stationary_farm();
	// return;
	if (character.name == LEADER) {
		default_farm("bat");	
	}
	if (SLAVES.includes(character.name)) {
		support_leader();
		// transport("main",4)
	}
}
