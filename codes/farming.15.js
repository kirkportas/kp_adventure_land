
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


		if (target.hp > 10000 && character.mp > 500) {
			use_skill("supershot", target);
		} 
	}

	// todo half-arsed energize code.
	// Meant to support Ranger while 3shot farming
	if (character.ctype == "mage" && character.mp >= 1000) {
		let rangerObj = parent.entities[NameRanger];
		let priestObj = parent.entities[NamePriest];

		// meant for targeting bosses
		if (target.hp > 1000000) {
			use_skill("burst", target);
		}

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

var last_magiport_request = Date.now();
var magiporters = ["Bjaryn","Clarity"];
function request_magiport_to_boss() {
	// assume same server
	if (Date.now() - last_magiport_request > 3000) {
		Logger.log("Sending magiport request to []");
		send_cm("Bjarny", "magiport");
		send_cm("Clarity", "magiport");
		last_magiport_request = Date.now();
		// todo check if online or not
		// send_cm("Clarity", "magiport");
	}
}

// For certain zones, accept magiports to join the battle
var magiport_zones = ["mrgreen","mrpumpkin"];
var farm_last_hit_ts = Date.now();
function move_to_zone(zone) {
	// no debug for rangers
	let verbose = character.ctype != "ranger";

	let out_of_range = distance(character, zone) > 400;
	if (verbose) Logger.log("Move_to_zone()");
	// Intended to handle respawn, and manual actions 
	if (verbose) Logger.log(`zone: ${zone}`);
	if (verbose) Logger.log("magiport zone? "+magiport_zones.includes(zone.name));
	if (verbose) Logger.log("out_of_range? "+out_of_range);
	if (verbose) Logger.log("now-last_magiport_request "+(Date.now() - last_magiport_request));
	if (zone.name && magiport_zones.includes(zone.name)) {
		// assume same server
		if (out_of_range) {
			if (verbose) Logger.log("Auto-requesting boss magiport");
			request_magiport_to_boss();
		}
	}
	if (is_moving(character)) return true;
	let distance_to_zone = distance(character, zone);
	// game_log(`distance_to_zone: ${distance_to_zone}`);
	// game_log(`maxRadius: ${zone.maxRadius}`);

	if (zone && zone.map != character.map) {
		// Logger.log("FarmZone return - changing maps: " + zone.toString());
		smart_move(zone);
		return true;
	}

	if (zone) {
		// x,y, maxdistance
		let is_bad_state = Date.now() - farm_last_hit_ts > 5000;
		if (out_of_range) {
			// todo can get stuck on corners
			// Logger.log("FarmZone return out_of_range: " + zone.toString());
			if (distance(character, zone) < 100) {
				move(zone.x, zone.y);
				return true;
			}
			smart_move(zone);
			return true;
		}
		// if (is_bad_state) {
		// 	// todo can get stuck on corners
		// 	game_log("FarmZone return is_bad_state: " + zone.toString());
		// 	smart_move(zone);
		// 	return true;
		// }
	}

	// Avoid stacking up on the zone coords
	if (character.x == zone.x && character.y == zone.y) {
		jitter_move(15);
	}
	return false;
}

// todo refactor to just separate from each other
function jitter_move(maxJitter) {
	game_log("Jitter move!");
	let minJitter = 15;
	var plusOrMinus1 = Math.random() < 0.5 ? -1 : 1;
	var plusOrMinus2 = Math.random() < 0.5 ? -1 : 1;
	move(character.x + plusOrMinus1*(Math.random(maxJitter)+minJitter),
		 character.y + plusOrMinus2*(Math.random(maxJitter)+minJitter));
}

// WIP method - todo refactor
function three_shot_farm(zone) {
	let pvp = attack_pvp_enemies();
	if (pvp) return;

	if (zone && move_to_zone(zone)) return; 

	// Note any async function is a promise.
	// Note any return type of Promises is "truthy"

	if (fire_3_shot() == true) {
		Logger("fire_3_shot true");
		farm_last_hit_ts = Date.now();
	} else {
		// game_log("fire_3_shot false");
		stationary_farm();
	}
}

//to do  t.getTime is not a frunction error on mssince. 
function default_farm(mon_type, zone) {
	if (should_abort()) { 
		game_log("ABORTING DEFAULT FARM()");
		Logger.log("ABORTING DEFAULT FARM()");
		set_message("ABORTING");
		return; 
	}
	// For priest, attempt to heal and skip attack if a heal occurs.
	if (heal_party_member()) { return; }
	if (zone && move_to_zone(zone)) return; 

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
		farm_last_hit_ts = Date.now();
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

function stationary_farm(zone) {
	if (should_abort()) { return; }
	if (heal_party_member()) { return; }
	let pvp = attack_pvp_enemies();
	if (pvp) return;

	if (zone && move_to_zone(zone)) return; 

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
		farm_last_hit_ts = Date.now()
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


class Zone{
    constructor(params) {
        this.x = params.x;
        this.y = params.y;
        this.map = params.map;
        this.maxRadius = params.maxRadius;
        this.name = params.name;
    }

    toString() {
    	return `name: "${this.name}", (${this.x},${this.y}), "${this.map}", maxRadius ${this.maxRadius}`;
    }
}
var ratzone = new Zone({"x":0, "y":0, "map":"mansion", "maxRadius":210, "name":"rats"});
var beezone = new Zone({"x":490, "y":1070, "map":"main", "maxRadius":30, "name":"bees"});
var mrpumpkinzone = new Zone({"x":25, "y":400, "map":"halloween", "maxRadius":400, "name":"mrpumpkin"});
var mrgreenzone = new Zone({"x":50, "y":600, "map":"spookytown", "maxRadius":400, "name":"mrgreen"});

/*
mrpumpkin
25,414,304
halloween -501,780
mrgreen
34,730,510
spookytown 565,1042
*/

function hween_boss_is_up() {
	let engaged = get(ALDATA_EVENTS_ENGAGED_KEY);
	if (engaged.length == 0) return; 
}
/*
{"id":26,
"server_region":"EU",
"server_identifier":"PVP",
"eventname":"mrpumpkin",
"live":true,"spawnval":null,"spawn":null,
"x":-501.5687512446685,"y":780.6662185227406,
"map":"halloween",
"hp":25414304,
"max_hp":36000000,"target":null,
"lastupdateval":"2021-10-06T01:01:32.8122485",
"lastupdate":"2021-10-06T01:01:32.8122485Z"},


{"id":27,"server_region":"EU","server_identifier":"PVP","eventname":"mrgreen","live":true,"spawnval":null,"spawn":null,"x":565.6089595752,"y":1042.8845467545423,"map":"spookytown","hp":34730510,"max_hp":36000000,"target":null,"lastupdateval":"2021-10-06T01:01:32.8590062","lastupdate":"2021-10-06T01:01:32.8590062Z"},
*/
var last_fight_ts = 0;
function switch_to_event_server(event) {
	if (Date.now() - last_fight_ts < 2000) return;
	let is_same_server = event.server_region == parent.server_region && event.server_identifier == parent.server_identifier; 
	if (is_same_server) { return }

	// Switch to Warrior if on lowbie ranger
	if (character.name == NameRanger2) {
		let charname = "Terazarrior"; 
		parent.window.location.href="/character/"+charname+"/in/"+event.server_region+"/"+event.server_identifier+"/";
		return;		
	}

	// Switch to 2nd Ranger if farming bees
	if (character.name == NameWarrior && event.eventname == "bee_genocide") {
		let charname = "BigBowBigHo"; 
		parent.window.location.href="/character/"+charname+"/in/"+event.server_region+"/"+event.server_identifier+"/";
		return;		
	}
	change_server(event.server_region, event.server_identifier); // change_server("EU","I") ("ASIA","PVP") or ("US","III")
}

var last_stop_ms = Date.now();
function halloween_farm() {
	let verbose = character.ctype != "ranger";
	if (verbose) Logger.log("halloween_farm");
	// run away if bosses are spawned on PVP while returning to normal farm

	// Continue if already fighting
	if (get_nearest_monster({"type":"mrpumpkin"})) {
		if (parent.server_identifier == "PVP") {
			_party_farm();
			return;
		}
		mrpumpkinfarm();
		if (verbose) Logger.log("Engaged against mrpumpkin");
		return;
	} else if (get_nearest_monster({"type":"mrgreen"})) {
		if (parent.server_identifier == "PVP") {
			_party_farm();
			return;
		}
		mrgreenfarm();
		if (verbose) Logger.log("Engaged against mrgreen");
		return;
	} 

	let event;
	let hp_threshold = 0.7; // lowered to 70%
	let engaged = get(ALDATA_EVENTS_ENGAGED_KEY);
	// let priority = "mrpumpkin";

	// Todo refactor to method
	let engaged_pumpkin_event = engaged.filter(e => 
		e.eventname == "mrpumpkin"
		&& e.hp/e.max_hp > hp_threshold
		&& e.hp/e.max_hp < e.max_hp*0.97)[0];
	let engaged_mrgreen_event = engaged.filter(e => 
		e.eventname == "mrgreen"
		&& e.hp/e.max_hp > hp_threshold
		&& e.hp/e.max_hp < e.max_hp*0.97)[0];

	let new_engagement = engaged_pumpkin_event || engaged_mrgreen_event;
	if (verbose) Logger.log("engaged_pumpkin_event: "+engaged_pumpkin_event);
	if (verbose) Logger.log("engaged_mrgreen_event: "+engaged_mrgreen_event);
	if (verbose) Logger.log("new_engagement: "+new_engagement);

	// if (is_moving(character)) {
	// 	if (verbose) Logger.log("Hween farm: is_moving");
	// 	return;
	// } 

	// Only begin if >80% health
	event = engaged_pumpkin_event;
	if (event) {
		let zone = new Zone({"x":event.x, "y":event.y, "map":event.map, "maxRadius":400, "name":"mrpumpkin"});
		switch_to_event_server(event);
		request_magiport_to_boss();
		mrpumpkinfarm(zone);
		Logger.log("Moving to new mrpumpkin");
		last_fight_ts = Date.now();
		return;
	}

	event = engaged_mrgreen_event;
	if (event) {
		let zone = new Zone({"x":event.x, "y":event.y, "map":event.map, "maxRadius":400, "name":"mrgreen"});
		switch_to_event_server(event);
		request_magiport_to_boss();
		mrgreenfarm(zone);
		Logger.log("Moving to new mrgreen");
		last_fight_ts = Date.now();
		return;
	}

	// Default to normal farming (bees)
	// Logger.log("No mrpumpkin / mrgreen, default farming");
	_party_farm();
}

// todo refactor/extract basic farming target and attack logic
function mrpumpkinfarm(zone) {
	last_fight_ts = Date.now();
	let mtype = "mrpumpkin";
	if (heal_party_member()) { return; }
	if (zone && move_to_zone(zone)) return; 

	var target=get_targeted_monster();
	if(!target || !is_in_range(target)) {
		target=get_nearest_monster({"type":mtype});
		if(target) {
			change_target(target);
		} else {
			set_message("No Monsters");
			return;
		}
	}
	
	if(is_in_range(target)) {
		set_message("Attacking");
		attack_plus_skills(target);
		farm_last_hit_ts = Date.now();
	} else {
		move(character.x+(target.x-character.x)/2,
			 character.y+(target.y-character.y)/2);
	}
}

function mrgreenfarm(zone) {
	last_fight_ts = Date.now();
	let mtype = "mrgreen";
	if (heal_party_member()) { return; }
	if (zone && move_to_zone(zone)) return; 

	var target=get_targeted_monster();
	if(!target || !is_in_range(target)) {
		target=get_nearest_monster({type:mtype});
		if(target) {
			change_target(target);
		} else {
			set_message("No Monsters");
			return;
		}
	}
	
	if(is_in_range(target)) {
		set_message("Attacking");
		attack_plus_skills(target);
		farm_last_hit_ts = Date.now();
	} else {
		move(character.x+(target.x-character.x)/2,
			 character.y+(target.y-character.y)/2);
	}
}

var FARMING_DEBUG = false;
// if (character.name == NameRanger) { FARMING_DEBUG = true; }

// function hween_boss_is_engaged() {

// }
var RARE_MOB_TYPES = ["cutebee","greenjr","goldenbat","phoenix","squigtoad",
	"mrpumpkin","mrgreen"];

// Called by all fighter characters
function party_farm() {
	if (character.name == NameRanger) {
		_party_farm()
	} else {
		halloween_farm();
	}
	// _party_farm();
}

var party_event = {"server_region":'US',"server_identifier":'PVP', "eventname": "bee_genocide"};
function _party_farm() {
	FARMING_DEBUG && game_log("party_farm");
	if (should_abort()) { return; }

	// Switch back to bee server
	switch_to_event_server(party_event);

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
			// default_farm("mrpumpkin");
			default_farm(); 

			// default_farm("rat", ratzone); 
		} 
		else if (character.name == NameRogue) {
			support_leader();
			// default_farm("bee");	
			// attack loop testing
			// change_target(get_best_target());
			// if (target && !is_in_range(target) && !is_moving(character)) {
			// 	move_halfway(target);
			// }

		} 
		else if (character.ctype == "ranger") {
			// default_farm("mrpumpkin");
			// support_leader();
			// default_farm("bee", beezone); 
			three_shot_farm(beezone);

		} else if (SLAVES.includes(character.name)) {
			stationary_farm(beezone);
			// default_farm("bee", beezone); // This seemed bugged
			// default_farm("mrpumpkin"); 
			// support_leader();
		}
	}
}


game_log("Finished load_code( farming )");