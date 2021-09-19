

const LOCATIONS = {
	"bees": {'x': 194, 'y': 1474, 'range':150},
	"crabs": {'x': -1184, 'y': -70, 'range':300},
};

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
function move_to_town(){
	if (!is_moving(character)) {
		smart_move("town");
	}
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
Examples: 

smart_move("bank")
show_json(character.bank)
> {"items0": [{},{}],
   "items1": ...
   "gold": 200000

*/