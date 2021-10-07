/* exports ACTIVE_PARTY */
// Line 1. Note that this file only runs once.
set_message("Start!");

load_code("Logger");
Logger._.init();
Logger.ACTIVE=true;
game_log("LOGGER INACTIVE");

//todo Move to GUI
add_top_button("magiportBoss","magiportBoss",  function () {
	// assume same server
	Logger.log("Manually Sending magiport request to []");
	send_cm("Bjarny", "magiport");
	send_cm("Clarity", "magiport");
});


Logger.functionEnter("Loading utils_init");

const specialMonsters = ["cutebee", "snowman", "goldenbat",
    "wabbit", "phoenix", "fvampire", "grinch"];

const LOADGUI = false;
const LOADSLAVES = false;

// Generic timestamps
const TIMESTAMP_KEY = "ts-"+character.name;
set(TIMESTAMP_KEY, Date.now());
var start_ts = Date.now();

// Kirk's characters
const NameRanger = "Terranger";
const NamePriest = "NoHeals4U";
const NameWarrior = "Terazarrior";
const NameMage = "Terakazam";
const NameRogue = "Terrogue";
const NameRanger2 = "BigBowBigHo";
const NamePally = "DeusestVult";
// For console pasting: ["Terazarrior","NoHeals4U","Terranger"]

var NameMerchant = "CurvyMoney";
var LEADER = NameWarrior;
var SLAVES = [NameRanger, NameMage, NamePriest, NameRogue];
const KIRKS_TOONS = [NameMerchant, NameRanger, NamePriest, NameWarrior, 
					 NameMage, NameRogue, NameRanger2, NamePally];

// var SLAVES = [NameRanger, NamePriest];    // **********************
const ACTIVE_PARTY = [NameRanger, NamePriest];

// Val's characters 
const NameValWarrior = "AlextheGreat";
const NameValMage = "LadyMary";
const NameValMerchant = "LeglyBlonde";
const NameValRogue = "WendyWench";
const VALS_TOONS = [NameValWarrior, NameValMage, NameValMerchant, NameValRogue];

// Val's leader. (Overwrite values for Kirk if Val is using the code)
if (VALS_TOONS.includes(character.name)) {
	LEADER = NameValWarrior;
	SLAVES = [NameValMage, NameValMerchant, NameValRogue];
	NameMerchant = NameValMerchant;
}

// Used for verifying that the requested is "friendly" for party requests
const ALLTOONS = KIRKS_TOONS.concat(VALS_TOONS);

// Misc constants
const PONTY_KEY = "ponty_items_to_buy";


// Configure upgrade/compound actions
const max_level_upgrade = 3; // Only used for a GUI function (intended for lowlevel)
const UPGRADEABLE_LEVELS = {
	// Wanderers
	"wcap": 7,
	"wgloves": 7,
	"wbreeches": 7,
	"wshoes": 7,
	"wattire": 5,
	"wshield": 7,

	"cape": 7,

	// T2
	"shield": 5,

	// Misc
	"slimestaff": 7,
	// "stinger": 5,     // Maybe trash


	// Heavy (starts at Rare)
	// "hpants": 3,
	// "hgloves": 3,


	// Weapons
	"cclaw": 7,
	"woodensword": 6,
	"oozingterror": 6,
	"t2bow": 6,
	"pmace": 5,
	"hbow": 5,
	"candycanesword": 5,
	"maceofthedead": 5,
	"bowofthedead": 5,
	"staffofthedead": 5,
	"swordofthedead": 4,
	"rapier": 5,
	"firebow": 5,
	"harbringer": 5,

	// Christmas set
	"merry": 5,
	"xmassweater": 7,
	"xmace": 6,

	// Halloween
	"phelmet": 6,


	// shirts
	"tshirt1": 5,
	"tshirt2": 5,
	"tshirt3": 5,
	"tshirt4": 5,
	"tshirt5": 5,
	"tshirt6": 5,

	"rod": 4,
	"pickaxe": 4

	// Trashed items
	// "throwingstars": 7,
	// Rugged
	// "pants1": 7,       //RuggedPants
	// "coat1": 7,
	// "shoes1": 7,
	// "helmet1": 7,
	// "gloves1": 7,

};

const max_level_compound = 3;
game_log("max_level_compound: "+max_level_compound);
var COMPOUNDABLE = ["wbook0"]; // = ["hpamulet","ringsj","hpbelt","wbook0"];
COMPOUNDABLE=COMPOUNDABLE.concat([
	"vitamulet","stramulet","intamulet","dexamulet",			// Amulets
	"vitearring","strearring","intearring","dexearring", 		// Earrings
	"vitring","dexring","intring","strring", 					// Rings
	"orbg","jacko",												// Orbs
	 															// Weapons
	"lbelt", "hpbelt","strbelt","dexbelt","intbelt"				// Belts
]); 

// const COMPOUNDABLE_LEVELS = {
// 	"wbook0": 3,
// 	"strearring": 3,
// 	"vitearring"
// };

// Default all shop items to lvl 6 (to help clear out inventory)
const shop_items = ["helmet","shoes","gloves","pants","coat", "bow","blade","staff","wshield"];
for (itemname of shop_items) {
	UPGRADEABLE_LEVELS[itemname] = 7;
} 

const UPGRADEABLE = Object.keys(UPGRADEABLE_LEVELS);

var LOW_CRAFT_ITEMS = ["gslime","crabclaw","beewings","seashell","bwing","snakeoil","snakefang","spores","whiteegg"];
var FARMABLE = ["gem0", "leather", "bfur", "cscale", "feather0", "ascale", "spidersilk"];
FARMABLE = FARMABLE.concat(LOW_CRAFT_ITEMS);
FARMABLE = FARMABLE.concat(["vitearring","strearring","dexearring","intearring"]);
FARMABLE = FARMABLE.concat(["vitamulet","stramulet","dexamulet","intamulet"]);
FARMABLE = FARMABLE.concat(["candy0","candy1","pvptoken"]);
FARMABLE = FARMABLE.concat(["stinger","wbook0"]);
FARMABLE = FARMABLE.concat(["vitscroll","scroll0","scroll1"]);
FARMABLE = FARMABLE.concat(["lostearring","rattail"]);
FARMABLE = FARMABLE.concat(["gemfragment"]);


// This won't sell at item.level >=2  (check method sell_all_trash)
var TRASH = ["stinger","hpamulet","ringsj", "hpbelt"];
TRASH = TRASH.concat(["gloves1","coat1","helmet1","shoes1","pants1"]);
TRASH = TRASH.concat(["throwingstars"]);
// "hpbelt"

// These localstorage vars are used for passing items to the Merchant
set("give_items_"+NameWarrior, []);
set("give_items_"+NamePriest, []);
set("give_items_"+NameRanger, []);
// get("give_items_"+character.name)

// Load utility functions (potions..)
Logger.functionEnter("Loading shared code files");
	try { load_code("mainloop"); } 			catch(err) { Logger.log("Error loading mainloop: "+err); }
	try { load_code("shared_executions"); } catch(err) { Logger.log("Error loading shared_executions: "+err); }
	try { load_code("use_items"); } 	    catch(err) { Logger.log("Error loading use_items: "+err); }
	try { load_code("upgrade_items"); } 	catch(err) { Logger.log("Error loading upgrade_items: "+err); }
	try { load_code("farming"); } 		    catch(err) { Logger.log("Error loading farming: "+err); }
	try { load_code("utils"); } 		    catch(err) { Logger.log("Error loading utils: "+err); }
	try { load_code("utils_events"); } 	    catch(err) { Logger.log("Error loading utils_events: "+err); }
	try { load_code("utils_movement"); }    catch(err) { Logger.log("Error loading utils_movement: "+err); } 
	try { load_code("stats"); }    			catch(err) { Logger.log("Error loading stats: "+err); } 
	// var init_comms = false;
	try { load_code("comms"); }    			catch(err) { Logger.log("Error loading comms: "+err); }
	try { load_code("missions"); }    		catch(err) { Logger.log("Error loading missions: "+err); }  
Logger.functionExit("Loading shared code files", 0);

load_code("gui_codecost");
if (character.name == LEADER) {
// if (character.name == "DONTRUN") {
	Logger.functionEnter("Loading LEADER files");
	if (LOADGUI) {		
		try {
			// Load GUI modules
			// load_code("gui_minimap"); 
			// load_code("gui_codecost");
			// load_code("gui_render_party");
			// load_code("gui_command_center");
			// Logger.log("Gui ended");
		} 
		catch(err) { Logger.log("Error loading GUI: "+err); } 
	}
	Logger.functionExit("Loading LEADER files", 0);

	// Load slave toons (2 additional fighters)
	if (LOADSLAVES) {
		Logger.functionEnter("Starting slaves");
		start_chars(); 
		setInterval(start_chars, 15000);
		Logger.functionExit("Starting slaves", 0);	
	}
}

// Val
if (character.name == NameValWarrior) {
	load_code("gui_minimap"); 

	// Load slave toons
	// start_chars(); 
	// setInterval(start_chars, 15000);
}

if (character.ctype == "merchant") {
	load_code("gui_command_center");
} else {
	add_top_button("showGive","showGive", showGiveItems);
}

Logger.functionExit("Loading utils_init", 0);
Logger.logPrintStack();

// GUI Customizations one-offs
// Widen the game log area
parent.$('#gamelog').css({'width':'450px'});


/**** Stats ********************************************************/
// show_json(get("stats_bestiary"))
// BESTIARY
var STATS_BESTIARY_KEY = "stats_bestiary";
if (character.name == NameWarrior) {
	initialize_bestiary();
}
var STATS_BESTIARY = get(STATS_BESTIARY_KEY);
// wipe access to bestiary for any other characters.
if (character.name != NameWarrior) {
	STATS_BESTIARY_KEY = "test";
	STATS_BESTIARY = undefined;
}




/* 
var filtered = Object.keys(G.items).reduce(function (filtered, key) {
    if ("compound" in G.items[key]) filtered[key] = G.items[key];
    return filtered;
}, {});
show_json( Object.keys(filtered))
*/

// var ALL_COMPOUNDABLE_ITEMS = new Set([
//     "dexamulet",
//     "armorring",
//     "jacko",
//     "mbelt",
//     "goldbooster",
//     "rednose",
//     "test_orb",
//     "zapper",
//     "t2dexamulet",
//     "dexbelt",
//     "hpbelt",
//     "t2stramulet",
//     "orbofdex",
//     "molesteeth",
//     "lbelt",
//     "darktristone",
//     "ringofluck",
//     "ctristone",
//     "lostearring",
//     "dexring",
//     "rabbitsfoot",
//     "goldring",
//     "strbelt",
//     "charmer",
//     "orbofint",
//     "northstar",
//     "orbofvit",
//     "trigger",
//     "xpbooster",
//     "intbelt",
//     "orbofsc",
//     "ftrinket",
//     "mearring",
//     "solitaire",
//     "cearring",
//     "cdarktristone",
//     "strearring",
//     "wbook0",
//     "wbook1",
//     "t2intamulet",
//     "mpxamulet",
//     "tristone",
//     "coal",
//     "resistancering",
//     "sanguine",
//     "hpamulet",
//     "orbofstr",
//     "ringsj",
//     "talkingskull",
//     "lantern",
//     "luckbooster",
//     "intring",
//     "cring",
//     "dexearring",
//     "intearring",
//     "amuletofm",
//     "santasbelt",
//     "vitring",
//     "vring",
//     "suckerpunch",
//     "snring",
//     "intamulet",
//     "vorb",
//     "exoarm",
//     "mpxbelt",
//     "vitearring",
//     "stramulet",
//     "strring",
//     "dexearringx",
//     "orbg"
// ]);


var ALDATA_EVENTS_LIVE_KEY = "cache_aldata_live_events";
var ALDATA_EVENTS_ENGAGED_KEY = "cache_aldata_engaged_events";

game_log("Finished load_code( utils_init )");
