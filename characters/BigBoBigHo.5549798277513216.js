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

// setInterval(check_franky_bow, 5005); 
function check_franky_bow() {
	Logger.log("check_franky_bow");
	GetServerStatuses(s => { 

		// for (let foo of s) {
		// 	for (let [k, v] of Object.entries(foo)) {
		// 		Logger.log(`k: ${k}       v: ${v}`);
		// 	}
		// }
		Logger.log("GetServerStatuses returned");
		// Ignore pvp servers
		let liveEvents = s.filter(e => true == e.live );
		Logger.log("liveEvents[0].eventname: "+liveEvents[0].eventname);

		Logger.log("======== LIVE franky EVENTS START ===================");
		for (let foo of liveEvents) {
			for (let [k, v] of Object.entries(foo)) {
				if (foo.eventname == "franky") {
					Logger.log(`k: ${k}       v: ${v}`);
				}
			}
		}
		Logger.log("======== LIVE frankyEVENTS END ===================");


		let engagedEvents = liveEvents.filter(function(e) { 
			// Logger.log(`engaged: eventname ${e.ev}`)

			return true == e.live 
			&& "PVP" != e.server_identifier
			&& null != e.target 
			&& e.eventname == "franky"
		});
		// Logger.log("engagedEvents[0]: "+engagedEvents[0].toString());


		Logger.log("======== engaged EVENTS START ===================");
		for (let foo of engagedEvents) {
			for (let [k, v] of Object.entries(foo)) {
				Logger.log(`k: ${k}       v: ${v}`);
			}
		}
		Logger.log("======== engaged EVENTS END ===================");

		for(let event of engagedEvents) {	
			Logger.log("Engaged: "+event.eventname);
			let region = event.server_region;
			let name = event.server_identifier;

			// let is_already_engaged = region == parent.server_region && name == parent.server_identifier;
			if (region && name) {
				Logger.log("Switching servers to hunt Franky");
				let charname = "Terazarrior"; 
				parent.window.location.href="/character/"+charname+"/in/"+region+"/"+name+"/";
				break;
			} 	
		}

		if (engagedEvents.length == 0) {
			// Keep farming on this character
		}	
	});
}