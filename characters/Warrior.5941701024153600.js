// Line 1
game_log("Loading Warrior char file");
load_code("utils_init");
var attack_mode=true;

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(scan_for_bestiary_updates, 9000);




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
var consecutive_hit_threshold = 1500; // 3 seconds
var track_hits_window_start_ts;
var previous_hit_ts;
var track_hits_current_data;

function track_hits() {
	// game_log("track_hits");

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

	// cutoff entries at ~1minute a piece
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
character.on("target_hit", function(data){
	// game_log("Hit for: "+data.damage); // evades still fire the event, with damage==0

	// Only track basic attacks
	if (data.source == "attack") {
		track_hits();
	}
});