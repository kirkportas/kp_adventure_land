


/* ALdata format
[
   {"id":19,
    "server_region":"EU",
    "server_identifier":"PVP",
    "eventname":"franky",
    "live":true,
    "spawn":null,
    "x":-241.69818792430758,
    "y":127.7970039462337,
    "map":"level2w",
    "hp":119835585,
    "max_hp":120000000,
    "target":null,
    "lastupdate":"2021-10-05T15:25:11.1373867"
    },
*/

function is_boss_engaged(bossname) {
	// This method takes a callback
	GetServerStatuses(s => { 
		let liveEvents = s.filter(e => true == e.live);
		let engagedEvents = liveEvents.filter(e => null != event.target);

		for(let event of engagedEvents)
		{
			let eventMsg = event.eventname + " live @ " + event.server_region + " " + event.server_identifier;
			if(null != event.target) {
				eventMsg += " fighting " + event.target;
			}
			game_log(eventMsg);
			if (event.eventname == bossname) {
				return true;
			}
		}
	});
}


function get_server_engaged_boss(bossname) {
	// This method takes a callback
	GetServerStatuses(s => { 
		// Ignore pvp servers
		let liveEvents = s.filter(e => true == e.live && e.server_identifier !="PVP");
		let engagedEvents = liveEvents.filter(e => null != event.target);

		for(let event of engagedEvents)
		{	
			if (event.eventname == bossname) {
				let val = {
					'server_region': event.server_region,
					'server_identifier': event.server_identifier
				};
				return val;
			}
		}
		return {};
	});
}

game_log("Finished load_code( utils_api )");
