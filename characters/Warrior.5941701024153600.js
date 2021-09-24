// Line 1
game_log("Loading Warrior char file");
load_code("utils_init");
var attack_mode=true;

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(scan_for_bestiary_updates, 9000);

// character.on("target_hit", function(data){
// 	// game_log("Hit for: "+data.damage); // evades still fire the event, with damage==0

// 	// Only track basic attacks
// 	if (data.source == "attack") {
// 		track_hits();
// 	}
// });


// Track consecutive hits. 
//
// let stats_hit_count = 0;
// let stats_hit_count_ts = undefined;
const STATS_HITS_KEY = "stats_warr_hits_per_time";
if (!get(STATS_HITS_KEY)) set(STATS_HITS_KEY,[]);

// // Data format [{'num_hits': 60, 'time_ms': 60}]
// var consecutive_hit_threshold = 3000; // 3 seconds
// var track_hits_window_start_ts;
// var previous_hit_ts;
// var track_hits_current_data;
// reset_track_hits();

// function track_hits() {
// 	let now = Date.now();
// 	let since_last_ms = now - previous_hit_ts;
// 	if (since_last_ms > consecutive_hit_threshold) {
// 		// abort
// 		reset_track_hits();
// 	} else {
// 		previous_hit_ts = now;
// 		track_hits_current_data['num_hits'] = 0;
// 		track_hits_current_data['time_ms'] = 0;
// 	}
// }

// function reset_track_hits() {
// 	previous_hit_ts = Date.now();
// 	track_hits_current_data = {};
// 	track_hits_current_data['num_hits'] = 0;
// 	track_hits_current_data['time_ms'] = 0;
// }