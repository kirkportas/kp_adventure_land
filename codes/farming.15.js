
var name_map = {
	'crabs': 'crab',
};

// Abort farm mission if attack_mode is disabled.
// This is used for a town-retreat when the script fails
// future use will be upon a battle loss 
function should_abort() {
	return !attack_mode;
}

function taunt_attackers() {
	for(id in parent.entities) {
		let mob = parent.entities[id];
		if(mob.type!="monster" || !mob.visible || mob.dead) continue;
		if ("target" in mob && mob.target != NameWarrior && ALLTOONS.includes(mob.target)) {
			use_skill("taunt", mob);
			break;
		}
	}
}

function attack_plus_skills(target) {

	// Warrior Taunt
	if (character.ctype == "warrior") {
		taunt_attackers();

		// Pause and heal up if the selected target has no target.
		// i.e. Don't start a new fight, but do defend if targeted.
		if (!target.target && character.hp/character.max_hp<0.7) {
			game_log("Waiting to engage until healed");
			return;
		}

		// If the selected target is targeting a friendly, taunt them.
		if ("target" in target && target.target != NameWarrior && ALLTOONS.includes(target.target)) {
			game_log("Taunting: "+target.mtype);
			use_skill("taunt");
		}
	}

	// Ranger HuntersMark. duration is 10seconds. 
	if (character.ctype == "ranger") {
		let mp_ratio = character.mp / character.max_mp;
		
		// Mark if mp is near full and >~4k hitpoints left.
		let should_mark = mp_ratio>0.9 && (target.hp > character.attack*6);
		if (should_mark) {
			game_log("HunterMark on: "+target.mtype);
			use_skill("huntersmark");
		} else {
			// game_log("mp_ratio: "+mp_ratio);
			// game_log("target.hp: "+target.hp);
		}
	}

	// todo half-arsed energize code.
	// Meant to support Ranger while 3shot farming
	if (character.ctype == "mage" && character.mp >= 1000) {
		let rangerObj = parent.entities[NameRanger];
		let priestObj = parent.entities[NamePriest];

		if (is_in_range(rangerObj, "energize")) {
			let amount = rangerObj.max_mp - rangerObj.mp;
			use_skill("energize", NameRanger, amount);
			game_log("energize amount: "+amount);
		} 
		else if (is_in_range(priestObj, "energize")) {
			let amount = priestObj.max_mp - priestObj.mp;
			// game_log("Energizing "+NamePriest);
			use_skill("energize", NamePriest, amount);
		}
	}

	set_message("Attacking");
	attack(target);
}

// Intended for use with Ranger and 3shot
function get_in_range_mobs(mtype, skill_name) {
	let mobs = [];
	for(id in parent.entities) {
		var current=parent.entities[id];
		if(current.type!="monster" || !current.visible || current.dead) continue;
		if (mtype && current.mtype != mtype) continue;
		if(current && is_in_range(current, skill_name)) {
			mobs.push(current);
		}
	}
	return mobs;
}

//
var last_undefined = Date.now();
async function fire_3_shot(mtype) {
	
	// Skip if below lvl60
	if (character.level < G.skills["3shot"].level) {
		return false;
	}
	let mobs = get_in_range_mobs("bee", "3shot");

	// let mobs = get_in_range_mobs(mtype); // can pass undefined
	// use_skill("3shot", [])
	if (mobs.length >=3 && character.mp > 350) {

		// let targets = mobs.slice(0,3); 
		let targets = [ mobs[0], mobs[1], mobs[2] ];

	    let result = await use_skill("3shot", targets);
	    if (!result) {
	    	Logger.log("'result' is undefined: "+result);
	    	Logger.log("since last_undefined: "+(Date.now()-last_undefined));
	    	last_undefined = Date.now();
	    } else {
			console.log("'result' is defined: "+result);
	    }
	    result.then(function(res) { 
	    	Logger.log('3shot resolved'); 
	    	Logger.log(res); 
			return true;
	    }, function(rej) {
	    	Logger.log('3shot rejected'); 
	    	Logger.log(rej); 
			return false;
	    });

	    game_log("SHOULD NOT BE HIT");
	    Logger.log("SHOULD NOT BE HIT");
	} else {
		return false;
	}
}

let PVP_ENEMIES = ["RangerS", "MoneyS", "RogueS"];
function attack_pvp_enemies() {
	return false;
	for (let name of PVP_ENEMIES) {
		let bastard = parent.entities[name];
		if (!bastard) continue;
		if (bastard.rip) continue;

		if (character.ctype=="ranger" && is_in_range(bastard, "supershot")) {
			use_skill("supershot", bastard);
		} 

		if (is_in_range(bastard, "attack")) {
			attack(bastard);
			return true;
		}
	}
	return false;
}
// WIP method - todo refactor
function three_shot_farm() {
	let pvp = attack_pvp_enemies();
	if (pvp) return;

	// Note any async function is a promise.
	// Note any return type of Promises is "truthy"

	if (fire_3_shot() == true) {
		Logger("fire_3_shot true");
	} else {
		// game_log("fire_3_shot false");
		stationary_farm();
	}
}

function get_mobs_attacking_me() {
	// Rely on party method to avoid doublechecking all entities
	let hostile_mobs = get_mobs_attacking_party();
	let mobs = [];
	for(mob of hostile_mobs) {
		var current=parent.entities[id];
		
		// Target if attacking party members
		if(current.target == character.name) {
			mobs.push(current);
		}
	}
	return mobs;
}

function get_mobs_attacking_party() {
	let mobs = [];
	for(id in parent.entities) {
		var current=parent.entities[id];
		if(current.type!="monster" || !current.visible || current.dead) continue;
		
		// Target if attacking party members
		if(current.target && ALLTOONS.includes(current.target)) {
			mobs.push(current);
		}
	}
	return mobs;
}


// WIP method 
function get_best_target() {
	console.log("temp: 1");
	let current_target=get_targeted_monster();

	// Switch to 
	let attacking_mobs = get_mobs_attacking_party();
	console.log("temp: attacking_mobs "+ attacking_mobs[0]);
	if (attacking_mobs.length == 0 && !current_target) {
		return default_get_monster();
	}

	console.log("temp: 2");
	// Keep current target if present, and is targeting the party
	if (current_target && "target" in current_target && ALLTOONS.includes(current_target.target)) {
		return current_target;
	}

	//todo Prioritize targeting the weakest or the most dangerous
	// if (!attacker)
	console.log("temp: 3");
	for (let attacker of attacking_mobs) {
		if (attacker.target != LEADER) {
			return attacker;
		}
		return attacker;
	}

	console.log("temp: 4");
	game_log("get_best_target end of method");
	return default_get_monster();

	// 	// var c_dist=parent.distance(character,current);
	// 	// if(c_dist<min_d) min_d=c_dist,target=current;
	// }
}

function default_get_monster(mon_type) {

	// Restrict auto-fighting to a max ATT value.
	// mob_params["path_check"] = true; // Optional path_check param
	let mob_params = {"min_xp":100,"max_att":1250};
	if (mon_type) { mob_params["type"] = mon_type; }

	let target=get_nearest_monster(mob_params);
	if(target) { 
		change_target(target); 
	} else {
		set_message("No Monsters");
		return;
	}
	return target;
}

//to do  t.getTime is not a frunction error on mssince. 
var default_farm_last_hit_ts = Date.now();
function default_farm(mon_type, zone) {
	if (should_abort()) { 
		game_log("ABORTING DEFAULT FARM()");
		Logger.log("ABORTING DEFAULT FARM()");
		set_message("ABORTING");
		return; 
	}
	// For priest, attempt to heal and skip attack if a heal occurs.
	if (heal_party_member()) { return; }


	// Intended to handle respawn, and manual actions 
	if (zone && zone.map != character.map) {
		smart_move(zone);
		return;
	}

	if (zone) {
		// x,y, maxdistance
		let out_of_range = distance(character, zone) > zone.maxRadius;
		let is_bad_state = Date.now() - default_farm_last_hit_ts > 5000;
		if (is_bad_state && out_of_range) {
			// todo can get stuck on corners
			move(zone);
			game_log("Returning to zone");
			return;
		}
	}


	// if (mon_type) {
	// 	kpmove(mon_type);
	// }
	// Set plurals to single. e.g. "crabs" -> "crab"
	if (mon_type in name_map) {
		mon_type = name_map[mon_type];
	}

	var target = get_best_target();
	// var target=get_targeted_monster();
	if(!target) {
		target = default_get_monster(mon_type);
	}
	// Todo prioritize targeting monsters that are attacking us
	// if(target && )
	
	if(target && !is_in_range(target)) {
		// Walk half the distance
		move(character.x+(target.x-character.x)/2,
			 character.y+(target.y-character.y)/2);
	}
	else if(is_in_range(target))
	{
		default_farm_last_hit_ts = Date.now();
		attack_plus_skills(target);
	}
}

function franky_farm() {
	if (should_abort()) { return; }
	if (heal_party_member()) { return; }

	var target=get_targeted_monster("franky");
	if(!target || !is_in_range(target)) {
		target=get_nearest_monster();
		if(target) {
			change_target(target);
		} else {
			set_message("No Monsters");
			return;
		}
	}

	if (distance(character, target) > 20) {
		move(character.x+(target.x-character.x)/2,
			 character.y+(target.y-character.y)/2);
	}
	
	if(is_in_range(target)) {
		set_message("Attacking");
		attack_plus_skills(target);
	}
}

function stationary_farm() {
	if (should_abort()) { return; }
	if (heal_party_member()) { return; }
	let pvp = attack_pvp_enemies();
	if (pvp) return;

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
	
	if(is_in_range(target))
	{
		set_message("Attacking");
		attack_plus_skills(target);
	}
}

function heal_party_member() {

	if (character.ctype != "priest") return false;

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
	} else {
		// Corner case: If tank disconnects then check him specifically.	
		if (!("Terazarrior" in get_party())) {
			game_log("Terazarrior not in party");
			let warrior = parent.entities[NameWarrior];
			if (warrior) {
				let missing_hp = warrior.max_hp - warrior.hp;
				if (missing_hp > character.heal*0.8) {
					game_log("Healing WARRIOR out of party scope");
					game_log("Healing: "+warrior.name);
					heal(warrior);
					return true;
				}
			}
		}
	}
	return false;
}

function support_leader() {
	if (should_abort()) { return; }
	// Leader can disconnect -> should still heal and support while party_up() runs
	// if (get_party()[LEADER] == undefined) { return; }

	if (!is_moving(character)) {
		heal_party_member();
		move_to_leader();
	}
	if (is_moving(character)) {
		heal_party_member();
		return;
	}


	// show_json(get_entity(get_entity("Terranger").target))

	// The key:
	// change_target(parent.entities[ranger_target])
	if (heal_party_member()) { return; }

	var target=get_targeted_monster();
	if (!target && get_entity(LEADER) && "target" in get_entity(LEADER)) {
		var leader_target_id = get_entity(LEADER).target;
		var mob_obj = parent.entities[leader_target_id];

		// dont start a fight if the mob isnt targeting leader yet.
		// UNLESS its a cutebee, which doesn't fight back
		let should_attack = mob_obj && (["cutebee"].includes(mob_obj.mtype) || "target" in mob_obj);
		if(should_attack) {
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

var FARMING_DEBUG = false;
// if (character.name == NameRanger) { FARMING_DEBUG = true; }

var RARE_MOB_TYPES = ["cutebee","greenjr","goldenbat","phoenix","squigtoad"];
function party_farm() {
	FARMING_DEBUG && game_log("party_farm");
	if (should_abort()) { return; }

	var stop_for_rares = false;  // Ignore any rare monsters while farming
	// kpmove("bees");
	// stationary_farm();

	// Stop and kill any rare mobs that spawn nearby
	let rare_target = undefined;
	for (rare_type of RARE_MOB_TYPES) {
		rare_target = get_nearest_monster({"type":rare_type});
		if (rare_target) {
			break;
		}
	} 

	if (stop_for_rares && rare_target) {
		if (character.name == LEADER) {
			// default_farm("greenjr");
			default_farm(rare_target.mtype);
		}
		if (SLAVES.includes(character.name)) {	
			support_leader();
		}
	} 
	else {
		// default_farm("scorpion");
		// default_farm("snake");	
		// transport("main",4)

		if (character.name == LEADER) {
			// default_farm("spider"); 

			let ratzone = {"x":0, "y":0, "map":"mansion", "maxRadius":210};
			default_farm("rat", ratzone); 
		} 
		else if (character.name == NameRogue) {
			default_farm("bee");	
			// attack loop testing
			// change_target(get_best_target());
			// if (target && !is_in_range(target) && !is_moving(character)) {
			// 	move_halfway(target);
			// }

		} 
		else if (character.ctype == "ranger") {
			three_shot_farm();

		} else if (SLAVES.includes(character.name)) {
			stationary_farm();
			// default_farm("croc");	
			// support_leader();
		}
	}
}

game_log("Finished load_code( farming )");