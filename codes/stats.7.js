/*
 *  For tracking various in-game statistics
 *
 */ 


 // Todo gold-per-hour
 // Todo XP per hour

 // Attrs present in G.monsters
const MOB_ATTRIBUTES = [
	"name",

	// Core farming stats
	"level", // This is the key for identifying higher level mobs
	"xp",
	"max_mp",
	"max_hp",
	"difficulty",

	"abilities",

	// Maybe go up with levels
	"aggro",
	"attack",
	"armor",
	"charge",
	"dreturn",
	"lifesteal",
	"rage",
	"reflection",
	"resistance",

	// Validate if these change with level
	"damage_type",
	"frequency",
	"range",
	"respawn",
	"skin",
	"speed",

	// "hp", // no need
	// "mp", // no need
]

/* BESTIARY DEBUG

== 
show_json(get("stats_bestiary"));
==
var STATS_BESTIARY_KEY_DEBUG = "stats_bestiary";
var STATS_BESTIARY = get(STATS_BESTIARY_KEY_DEBUG);
let mtype = "ghost";
let level = 2;
show_json(
   STATS_BESTIARY.[mtype]?.[level]
   //STATS_BESTIARY[mtype] // works 
)

==
CURRENTLY OPTIONAL CHAINING WITH .[varname] IS NOT WORKING
===
let accessor1 = "access1";
let foo = {
	"access1": {
		2: "two",
		3: "three"
	}
};
show_json( foo.[accessor1]?.2 )
==
let accessor1 = "access1";
let foo = {
	"access1": {
		2: "two",
		3: "three",
		"bar": "meh",
	}
};
show_json( foo.[accessor1]?.bar )
==

*/
// Relies on STATS_BESTIARY var from utils_init
function scan_for_bestiary_updates() {
	let fnTxt = "bestiary_scan";
	Logger.functionEnter(fnTxt);
	let now = Date.now();
	Logger.log("Checking monster stats");
	let updated = false;

	for (let id in parent.entities) {
		let entity = parent.entities[id];

		if (entity.type != "monster") { continue; } // Skip non-monsters
		if (entity.level == 1) { continue; } // Skip lvl1, available in G.monsters

		let mtype = entity.mtype;
		let level = entity.level;
		if (!mtype || !level) {
			continue;
		}

		// let is_tracked = STATS_BESTIARY.[mtype]?.[level];
		let is_tracked = mtype in STATS_BESTIARY;
		is_tracked = is_tracked && level in STATS_BESTIARY[mtype];

		// Temporary, check for any new attributes
		if (is_tracked) {
			for (let attr of MOB_ATTRIBUTES) {
				if (!(attr in STATS_BESTIARY[mtype][level])) {
					// Ignore any Attributes in `MOB_ATTRIBUTES`` but not in `entity`.
					if (attr in entity) {
						game_log("Missing attr in bestiary: " + attr);
						game_log("mtype: " + mtype);
						game_log("level: " + level);
						is_tracked = false;	
						continue;
					} 
				}
			}
		}

		if (!is_tracked) {
			game_log(`Attempting Bestiary update: mtype "${mtype}" level ${level}.`);

			// Init dict for level and fill in attributes
			if (!STATS_BESTIARY[mtype][level] || !STATS_BESTIARY[mtype][level]["name"]) {
				STATS_BESTIARY[mtype][level] = {};
			}
			// Update every attr
			for (let attr of MOB_ATTRIBUTES) {
				STATS_BESTIARY[mtype][level][attr] = entity[attr];
			}
			updated = true;
			game_log(`Added to Bestiary: mtype "${mtype}" level ${level}.`);
		}
	}
	if (updated) {
		set(STATS_BESTIARY_KEY, STATS_BESTIARY);
		game_log("Saved Bestiary to localstorage");
	}
	Logger.functionExit(fnTxt, Date.now() - now);
}

//// Example from G.monsters
// "name": "Dark Hound",
// "rage": 1,
// "armor": 200,
// "hp": 19200,
// "respawn": 12,
// "resistance": 100,
// "attack": 320,
// "aggro": 1,
// "charge": 52,
// "frequency": 0.8,
// "damage_type": "physical",
// "skin": "wolfie",
// "range": 20,
// "xp": 16400,
// "speed": 24,
// "mp": 96

// Only expected to ever run once.
function initialize_bestiary() {
	if (!(character.name == NameWarrior)) {
		return;
	}

	// Init bestiary dict in localstorage if not present.
	if (!get(STATS_BESTIARY_KEY)) { set(STATS_BESTIARY_KEY, {}) };

	let STATS_BESTIARY = get(STATS_BESTIARY_KEY);

	// Preload all known monsters, save any added monsters
	let updated = false;
	for (mtype in G.monsters) {
		if (!(mtype in STATS_BESTIARY)) {
			STATS_BESTIARY[mtype] = {};
			updated = true;
		}
	}
	if (updated) {
		set(STATS_BESTIARY_KEY, STATS_BESTIARY);
		game_log("Initialized Bestiary");
	}
}

game_log("Finished load_code( stats )");