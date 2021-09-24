

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

//Scan for any monsters attacking the party.
function get_best_target() {

	for(id in parent.entities)
	{
		var current=parent.entities[id];
		if(current.type!="monster" || !current.visible || current.dead) continue;
		if(current.target && ALLTOONS.includes(current.target) ) {
			return current;
		}

		var c_dist=parent.distance(character,current);
		if(c_dist<min_d) min_d=c_dist,target=current;
	}
}

function attack_plus_skills(target) {

	// Warrior Taunt
	if (character.name == NameWarrior) {
		if (!target.target && character.hp/character.max_hp<0.6) {
			game_log("Waiting to engage until healed");
			return;
		}
		if ("target" in target && target.target != NameWarrior) {
			game_log("Taunting: "+target.mtype);
			use_skill("taunt");
		}
	}

	// Ranger HuntersMark. duration is 10seconds. 
	if (character.name == NameRanger) {
		let mp_ratio = character.mp / character.max_mp;
		
		// Mark if mp is near full and >~4k hitpoints left.
		let should_mark = mp_ratio>0.9 && (target.hp > character.attack*6);
		if (should_mark) {
			game_log("HunterMark on: "+target.mtype);
			use_skill("huntersmark");
		} else {
			game_log("mp_ratio: "+mp_ratio);
			game_log("target.hp: "+target.hp);
		}
	}

	set_message("Attacking");
	attack(target);
}

function default_farm(mon_type) {
	if (should_abort()) { 
		game_log("ABORTING DEFAULT FARM()");
		set_message("ABORTING");
		return; 
	}

	// For priest, attempt to heal and skip attack if a heal occurs.
	if (heal_party_member()) { return; }

	// if (mon_type) {
	// 	kpmove(mon_type);
	// }
	// Set plurals to single. e.g. "crabs" -> "crab"
	if (mon_type in name_map) {
		mon_type = name_map[mon_type];
	}
	var target=get_targeted_monster();
	if(!target) {
		// Restrict auto-fighting to a max ATT value.
		// mob_params["path_check"] = true; // Optional path_check param
		let mob_params = {"min_xp":100,"max_att":750};
		if (mon_type) { mob_params["type"] = mon_type; }

		target=get_nearest_monster(mob_params);
		if(target) { 
			change_target(target); 
		} else {
			set_message("No Monsters");
			return;
		}
	}
	
	if(!is_in_range(target)) {
		// Walk half the distance
		move(character.x+(target.x-character.x)/2,
			 character.y+(target.y-character.y)/2);
	}
	else if(can_attack(target))
	{
		attack_plus_skills(target);
	}
}

function stationary_farm() {
	if (should_abort()) { return; }
	if (heal_party_member()) { return; }

	// game_log("Stationary_farming");
	var target=get_targeted_monster();
	if(!target || !is_in_range(target))
	{
		target=get_nearest_monster({min_xp:200,max_att:70});
		//target=get_nearest_monster({min_xp:1000,max_att:30,path_check:true});
		if(target) {
			change_target(target);
		}
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

function heal_party_member() {

	if (character.name == NamePriest) {
		// Heal if the missing HP is greater than the healpower
		let weakest = lowest_health_partymember();
		let missing_hp = weakest.max_hp - weakest.hp;
		let heal_power = character.attack*0.8; // Heal with wasted 20%

		let should_heal = missing_hp > heal_power || weakest.health_ratio < 0.8;
		if (weakest.health_ratio < 0.4) {
			game_log("partyheal! Please don't die!");
			use_skill("partyheal");
		}
		if (is_on_cooldown("attack")) {
			return false;
		}
		if (should_heal) {
			if (is_in_range(weakest)) {
				game_log("Healing: "+weakest.name);
				heal(weakest);
			} else {
				game_log("Healing: moving to "+weakest.name);
				move(character.x+(weakest.x-character.x)/2,
			 		 character.y+(weakest.y-character.y)/2);
			}
			return true;
		}
	}
	return false;
}

function support_leader() {
	if (should_abort()) { return; }
	if (get_party()[LEADER] == undefined) { return; }

	if (!is_moving(character)) {
		heal_party_member();
		move_to_leader();
	}
	if (is_moving(character)) {
		heal_party_member();
		return;
	}

	// show_json(get_entity("Terranger").target)
	// show_json(get_entity(get_entity("Terranger").target))
	// var ranger_target = get_entity("Terranger").target;
	// game_log(ranger_target);
	// change_target(ranger_target)
	// show_json(get_entity(get_entity("Terranger").target))

	// The key:
	// change_target(parent.entities[ranger_target])
	if (heal_party_member()) { return; }

	var target=get_targeted_monster();
	if (!target && get_entity(LEADER) && "target" in get_entity(LEADER)) {
		var leader_target_id = get_entity(LEADER).target;
		var mob_obj = parent.entities[leader_target_id];

		if(mob_obj && "target" in mob_obj) {
			// game_log(mob_obj.target);
			// Logger.log("Changing target to leader target");
			//  && mob_obj.target == LEADER
			if ("target" in mob_obj) {
				change_target(mob_obj);
			}
		} else {
			// Logger.log("Can't target leader target");
			set_message("Can't target");
			return;
		}
	}
	target=get_targeted_monster();
	if(can_attack(target)) {
		set_message("Attacking");
		attack_plus_skills(target);
	} else {
		// Leader has no target
	}
}
/*
maps:
"main", "cave"
*/


var RARE_MOB_TYPES = ["cutebee","greenjr","goldenbat","phoenix","squigtoad"];
function party_farm() {
	if (should_abort()) { return; }

	// default_farm();
	// kpmove("bees");
	// stationary_farm();
	// return;

	// var greenjr_target = get_nearest_monster({"type":"greenjr"});

	// Stop and kill any rare mobs that spawn nearby
	let rare_target = undefined;
	for (rare_type of RARE_MOB_TYPES) {
		rare_target = get_nearest_monster({"type":rare_type});
		if (rare_target) {
			break;
		}
	} 


	if (rare_target) {
		if (character.name == LEADER) {
			default_farm("greenjr");
		}
		if (SLAVES.includes(character.name)) {	
			support_leader();
		}
	} 
	else {
		if (character.name == LEADER) {
			default_farm();
			// default_farm("snake");
			// default_farm("scorpion");	
		}
		if (SLAVES.includes(character.name)) {	
			// default_farm();
			// default_farm("snake");
			support_leader();
			// transport("main",4)
		}
	}
}
