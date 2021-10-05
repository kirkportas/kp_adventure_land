// Line 1
game_log("====== START ============");
game_log("====== START ============");
game_log("====== START ============");
game_log("Loading Warrior char file");
load_code("utils_init");
var attack_mode=true;

load_code("pattack");
// setInterval(attackloop, 25);

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(scan_for_bestiary_updates, 11000);
setInterval(cache_loop, 5000); 

setInterval(check_franky, 5005); 
function check_franky() {
	game_log("check_franky");
	GetServerStatuses(s => { 
		game_log("GetServerStatuses returned")
		// Ignore pvp servers
		let liveEvents = s.filter(e => true == e.live );
		let engagedEvents = liveEvents.filter(e => 
			true == e.live
			&& "PVP" != e.server_identifier
			&& null != event.target 
			&& event.eventname == "franky");

		for(let event of engagedEvents) {	
			let region = event.server_region;
			let name = event.server_identifier;

			// let is_already_engaged = region == parent.server_region && name == parent.server_identifier;
			if (region && name && !get_nearest_monster("franky")) {
				game_log("Switching servers to hunt Franky");
				let charname = "Terazarrior"; 
				parent.window.location.href="/character/"+charname+"/in/"+region+"/"+name+"/";
				break;
			} 	
		}

		if (engagedEvents.length == 0) {
			game_log("Switching to BigBowBigHo");
			let charname = "BigBowBigHo"; 
			let region = "US";
			let name = "PVP";
			parent.window.location.href="/character/"+charname+"/in/"+region+"/"+name+"/";
		}	
	});
}

// function swap_character() {
// 	let franky_server = get_server_engaged_boss("franky");
// 	let region = franky_server.server_region;
// 	let name = franky_server.server_identifier;

// 	// let is_already_engaged = region == parent.server_region && name == parent.server_identifier;
	
// 	// If franky is engaged and we're not fighting him.
// 	if (region && name && !get_nearest_monster("franky")) {
// 		let charname = "Terazarrior"; 
// 		parent.window.location.href="/character/"+charname+"/in/"+region+"/"+name+"/";
// 	} else {
// 		let charname = "BigBowBigHo"; 
// 		let region = "US";
// 		let name = "PVP";
// 		parent.window.location.href="/character/"+charname+"/in/"+region+"/"+name+"/";
// 	}
// }

/*** Track consecutive hits.  *******************************/
/* 
Noticed that the attacks are consistently freezing up for ~1second regularly.
Every 15-20ish hits (sample size ~5)

The time_ms jumps to ~double from 1175-1225 to ~2350 +/- 100.
Several times occurs on the *2nd* 'hit' logged after the death of a ghost.

show_json(get("stats_warr_hits_per_time"))
*/
// Init localstorage
const STATS_HITS_KEY = "stats_warr_hits_per_time";
if (!get(STATS_HITS_KEY)) set(STATS_HITS_KEY,[]);

// Data format [{'num_hits': 60, 'time_ms': 60}]
var consecutive_hit_threshold = 1500; // 1.5 seconds
var track_hits_window_start_ts;
var previous_hit_ts;
var track_hits_current_data;

function track_hits() {
	// Abort if too long has passed. (non-consecutive for any reason, like walking to a mob)
	let now = Date.now();
	let since_last_ms = now - previous_hit_ts;
	if (since_last_ms > consecutive_hit_threshold) {
		game_log("Track_hits() - Aborting. since_last_ms: "+since_last_ms);
		reset_track_hits();
		return; 
	} 

	game_log("tracking hit. since_last_ms: "+since_last_ms);
	previous_hit_ts = now;
	track_hits_current_data['num_hits'] += 1;
	track_hits_current_data['time_ms'] += since_last_ms;

	// cutoff entries at ~10seconds
	let threshold = 9750; // 29750; // 59750;
	if (track_hits_current_data['time_ms'] > threshold) {
		let stats_data = get(STATS_HITS_KEY);
		stats_data.push(track_hits_current_data);
		game_log("Track_hits() -  Add record: :"+track_hits_current_data.toString());
		set(STATS_HITS_KEY, stats_data);
		reset_track_hits();
	}
}

function reset_track_hits() {
	previous_hit_ts = Date.now();
	track_hits_current_data = {};
	track_hits_current_data['num_hits'] = 0;
	track_hits_current_data['time_ms'] = 0;
}

// Start!
reset_track_hits();
// character.on("target_hit", function(data){
// 	// Only track basic attacks
// 	if (data.source == "attack") {
// 		track_hits();
// 	}
// });

// import { parse } from 'node-html-parser'; // import only in module
// let stats = require('stats'); // require is not defined
// import { add, subtract } from './stats';

// console.log(`The addition is: ${stats.add(2, 3)}`);
// console.log(`The addition is: ${add(2, 3)}`);
// console.log(`The suntraction is: ${subtract(21, 19)}`);