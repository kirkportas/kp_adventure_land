// Line 1
game_log("====== START ============");
game_log("====== START ============");
game_log("====== START ============");
game_log("Loading BigBoBigHo char file");
load_code("utils_init");
load_code("pattack");
var attack_mode=true;

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(cache_loop, 5000); 


// Todo this is a quick hack
// Terazarrior is hardcoded to franky_farm and parked at franky.

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
			if (region && name) {
				game_log("Switching servers to hunt Franky");
				let charname = "Terazarrior"; 
				parent.window.location.href="/character/"+charname+"/in/"+region+"/"+name+"/";
				break;
			} 	
		}

		if (engagedEvents.length == 0) {
			// Keep farming on this character (BigBowBigHo)
		}	
	});
}