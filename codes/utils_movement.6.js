

const LOCATIONS = {
	"bees": {'x': 194, 'y': 1474, 'range':150},
	"crabs": {'x': -1184, 'y': -70, 'range':300},
};

// function is_in_location(loc_name) {
// 	show_json(distance(character, {x: -108, y:-143}) < 400);
// 	show_json(character.map)
// }

// transport("main",4) // Exit cave 
// transport("cave",0) // Enter cave 
function kpmove(loc_name){
	// game_log("loc_name: "+loc_name);
	var x = LOCATIONS[loc_name].x;
	var y = LOCATIONS[loc_name].y;
	if (!is_moving(character)) {
		if (distance_from_location(loc_name) > LOCATIONS[loc_name].range) {
			Logger.log("Moving to: "+loc_name);
			// game_log("Moving to: "+loc_name);
			smart_move(x,y);
		} 
	}
}

function is_in_town() {
	var cutoff = 200;
	// todo investigate the in_check param (currently false)
	return cutoff > distance(character, {x: -207, y: -108, map: "main"}, false );
}

function move_to_town(){
	if (!is_moving(character)) {
		smart_move("town");
	}
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
    return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));
}
function distance_to_entity(entity) {
    return Math.sqrt(Math.pow(character.real_x - entity.x, 2) + Math.pow(character.real_y - entity.y, 2));
}
function distance_from_coord(x,y) {
	var curr_x = character.x;
	var curr_y = character.y;

	var distance = Math.abs(curr_x-x) + Math.abs(curr_y-y);
	return distance;
}
function distance_from_location(loc_name) {
	var loc_x = LOCATIONS[loc_name].x;
	var loc_y = LOCATIONS[loc_name].y;

	var distance = Math.abs(loc_x-character.x) + Math.abs(loc_y-character.y);
	return distance;
}

/*
var foo = "Terranger";
var p = get_party();
var destination = {'x': p[foo].x, 'y': p[foo].y, 'map': p[foo].map}

show_json(destination)
smart_move(destination)
*/
// Move if farther away than 70
var last_called_move_to_leader = Date.now();
function move_to_leader() {
	if (is_moving(character)) { return; }
	if (Date.now() - last_called_move_to_leader < 500) {
		return;
	}
	last_called_move_to_leader = Date.now();

	var lead_entity = parent.entities[LEADER];
	try {
		if (lead_entity == undefined) {
			var p = get_party();
			var destination = {'x': p[LEADER].x, 'y': p[LEADER].y, 'map': p[LEADER].map}
			smart_move(destination);
			return;
		}
	} catch(err) { 
		game_log("cant check LEADER in Entities"); 
	}

	try {
		if (100 < distance(character, parent.entities[LEADER], true)) {
			move(character.x+(lead_entity.x-character.x)/2,
				  character.y+(lead_entity.y-character.y)/2 );
		}
	} catch(err) {
		game_log("Error closing range in move_to_leader()"); 
		smart_move(lead_entity);
	}
}

/*
Examples: 

smart_move("bank")
show_json(character.bank)
> {"items0": [{},{}],
   "items1": ...
   "gold": 200000

*/


game_log("Finished load_code( utils_movement )");
