
/**  EVENTS 
 * // https://adventure.land/docs/code/game/events
 * 
 * "event"		// Name, map, x, y
 * action
 * hit			// actor + target + source + damage + heal
 * level_up
 * shutdown     // Server shutdown in XX seconds 
 * death		// Character Name or Monster ID 
 * sell		// Item sold to an NPC
 * buy      	// Item bought from an NPC
 * sbuy		// Item bought from Ponty
 * fbuy		// Item bought from Lost and Found
 * item_sent // Player to player item transfer
 * gold_sent // Player to player gold transfer
 * cx_sent   // Player to player cosmetics transfer
 * api_response
**/

/** CODE MESSAGES 
 *  https://adventure.land/docs/guide/X.sub-cm
 * 
 * 
	send_cm("Wizard","hello"); // Send a string
	send_cm("Wizard",{"items":character.items}) // Send your inventory data as a CM
	send_cm(["Wizard","Protector"],{"task":"move","map":character.map,"x":character.x,"y":character.y})
	// you can send CM's to multiple recipients
	// Instead of sending code messages individually, send them to multiple recipients whenever possible, the code cost is lower



	function on_cm(name,data)
	{
		if(name!="Wizard") // Make sure to check who the CM came from
		{
			game_log("Unauthorized CM "+name);
			return;
		}
		show_json(data);
	}
*/


// called by the inviter's name - request = someone requesting to join your existing party
function on_party_request(name) 
{
	if (["MageS"].includes(name)) {
		accept_party_request(name);
	}
	// In a chaotic failure where all party members lose party status,
	// looping all charnames and requesting could cause a corner case failure. (e.g. 3 parties get formed) 
	// if (ALLTOONS.includes(name)) {
	// 	accept_party_request(name);
	// }

	/* Debug
		game_log("Received party request from: "+name);
		game_log("ALLTOONS: "+ALLTOONS);
		game_log("ALLTOONS.includes(name): "+ALLTOONS.includes(name));
	*/
}

/** 
 * Init game_event_list
 * To be used to identify all events we can hook into
 * Docs: http://adventure.land/docs/code/game/events
 *
  let key = "stats_game_events_dict";
  show_json( get(key) ); 
 */
function track_events() {
		
	const STATS_GAME_EVENT_DICT_KEY = "stats_game_events_dict";
	var game_event_list = get(STATS_GAME_EVENT_DICT_KEY);
	if (!game_event_list) {
		set(STATS_GAME_EVENT_DICT_KEY, {});
		game_event_list = get(STATS_GAME_EVENT_DICT_KEY) || {};
	}
	// {"eventname":}
	// Register to all events:
	game.all(function(name, data) {
		// data.event_name=name;
		// show_json(data);
		let should_save = false;

		if (!(name in game_event_list)) {
			game_event_list[name] = data;
			should_save = true;
			game_log("Tracking new event name: "+name);
		} else {
			// Add any missing fields
			try {
				for (let attr of Object.keys(data)) {
					if (!(attr in game_event_list[name])) {
						game_event_list[name][attr] = data[attr];
						should_save = true;
						game_log(`Tracking new event attr: ${name} - ${attr}`);
					}
				}	
			} catch(err) {
				game_log(`err: ${err}`);
				let datatypeof = typeof data;
				game_log(`typeof data : ${datatypeof}`);
				game_log(`data.toString() : ${data.toString()}`);
			}
		}
		if (should_save) {
			set(STATS_GAME_EVENT_DICT_KEY, game_event_list);
		}
	});
}

function cache_bank() {
	game_log("cache_bank");
	if (!is_in_bank()) return;
}

game_log("Finished load_code( utils_events )");


/**
 * wrap function 
 * @param {String} method name
 * @param {String} method to call before
 * @param {String} method to call after
 */
function wrap_method(methodname, before, after) {
	//parent.$("#maincode")[0].contentWindow
	let original_fn = methodname;
	if (!original_fn) {
		game_log("Wrap failed, fn not found: "+methodname);
		return;
	}
	if (typeof original_fn != "function") {
		game_log("Wrap failed, is not a fn: "+methodname);
		return;
	}

	is_on_cooldown = function() {
		game_log("wrapped! i: "+i);
		for (let arg of arguments) {
			game_log("args: ");
			game_log(arg);
		}
		i++;
		return foo.call(this, arguments);
	};
}
// wrapping in js
// https://trackjs.com/blog/how-to-wrap-javascript-functions/
/*
let foo = is_on_cooldown;
show_json( typeof foo );
let i = 0;
is_on_cooldown = function() {
	game_log("wrapped! i: "+i);
	for (let arg of arguments) {
		game_log("args: ");
		game_log(arg);
	}
	i++;
	return foo.call(this, arguments);
};
show_json( is_on_cooldown("attack") );
*/

/* 
//game_log(JSON.stringify([1,2,3]))
let bar = get("stats_game_events_list");
game_log( typeof(bar) );
game_log( bar instanceof Set );

game_log( "foo" );
let foo = new Set();
foo.add(1);
game_log( foo instanceof Set );

game_log( "footest" );
set("test", JSON.stringify(foo));
let footest = JSON.parse( get( "test"));
game_log( footest instanceof Set );
game_log( footest );


*/