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
const NameRanger2 = "BigBowBigHo";
const NamePriest = "NoHeals4U";
const NameWarrior = "Terazarrior";
const NameMage = "Terakazam";
const NameRogue = "Terrogue";
const NameRogue2 = "TERFnSURF";
const NamePally = "DeusestVult";
// For console pasting: ["Terazarrior","NoHeals4U","Terranger"]

var NameMerchant = "CurvyMoney";
var LEADER = NameWarrior;
var SLAVES = [NameRanger, NameMage, NamePriest, NameRogue];
const KIRKS_TOONS = [NameMerchant, NameRanger, NameRanger2, NamePriest, NameWarrior, 
					 NameMage, NameRogue, NameRogue2, NamePally];

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

const EXCHANGEABLES = ["candy1","candy0","gem0","mysterybox","armorbox"];

// Configure upgrade/compound actions
const max_level_upgrade = 3; // Only used for a GUI function (intended for lowlevel)
const UPGRADEABLE_LEVELS = {
	"broom": 6,

	// Wanderers
	"wcap": 7,
	"wgloves": 7,
	"wbreeches": 7,
	"wshoes": 7,
	"wattire": 7,
	"wshield": 7,

	"cape": 7,

	// T2
	"shield": 5,

	// Misc
	"slimestaff": 7,

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
	// "maceofthedead": 5,
	// "bowofthedead": 6,
	// "staffofthedead": 6,
	"daggerofthedead": 6,
	// "swordofthedead": 5,
	"rapier": 6,
	"fireblade": 6,
	"firebow": 5,
	"firestaff": 6,
	"firestars": 7,
	"harbringer": 6,

	// Christmas set
	"merry": 5,
	"xmassweater": 7,
	"xmaspants": 5,
	"xmasshoes": 5,
	"xmace": 6,
	"warmscarf": 5,
	"ornamentstaff": 5,

	"ololipop": 7,
	"glolipop": 7,

	// Halloween
	"phelmet": 6,
	// "gphelmet": 1,

	// Christmas
	"gcape": 4,

	// shirts
	"tshirt1": 5,
	"tshirt2": 5,
	"tshirt3": 5,
	"tshirt4": 5,
	"tshirt5": 5,
	"tshirt6": 5,

	"rod": 4,
	"pickaxe": 4

	/* Trashed items */
	// "throwingstars": 7,
	// Rugged
	// "pants1": 7,       //RuggedPants
	// "coat1": 7,
	// "shoes1": 7,
	// "helmet1": 7,
	// "gloves1": 7,

	// "stinger": 5,     // Maybe trash

};


// Default all shop items to lvl 8 (to help clear out inventory)
const shop_items = ["helmet","shoes","gloves","pants","coat", "bow","blade","staff","wshield"];
for (let itemname of shop_items) {
	UPGRADEABLE_LEVELS[itemname] = 8;
}
const UPGRADEABLE = Object.keys(UPGRADEABLE_LEVELS);

// Default code will block rare upgrades.
// Do not allow >7 upgrades except on Primary merchant account
var ALLOWED_PAST_7 = [];
var ALLOWED_RARE_UPGRADES = [];
if (character.name == "CurvyMoney") {
	ALLOWED_PAST_7 = shop_items;

	ALLOWED_RARE_UPGRADES = [
		"firestars"
	];
}


var COMPOUNDABLE_3s = [
	"wbook0",
	"vitearring","strearring","intearring","dexearring", 		// Earrings
	"vitring","dexring","intring","strring", 					// Rings
	"orbg","jacko", 											// Orbs
	"lbelt", "hpbelt","strbelt","dexbelt","intbelt",			// Belts
	"rednose"
];

const COMPOUNDABLE_LEVELS = {
	// Amulets
	"intamulet": 4,
	"dexamulet": 4,
	"stramulet": 4,
	"hpamulet": 4,
	"skullamulet": 3,

	// Earrings
	"strearring": 3,
	"vitearring": 3,

	// Orbs
	"talkingskull": 2,
	"lantern": 2,

	// Rings
	"ringsj": 4,
};
for (let itemname of COMPOUNDABLE_3s) {
	COMPOUNDABLE_LEVELS[itemname] = 3;
}
const COMPOUNDABLE = Object.keys(COMPOUNDABLE_LEVELS);


const DISMANTLE_ITEMS = ["staffofthedead","maceofthedead","swordofthedead","bowofthedead"];
    

var LOW_CRAFT_ITEMS = ["gslime","crabclaw","beewings","seashell","bwing","snakeoil","snakefang","spores","whiteegg"];
var FARMABLE = ["gem0", "leather", "bfur", "cscale", "feather0", "ascale", "spidersilk"];
FARMABLE = FARMABLE.concat(LOW_CRAFT_ITEMS);
FARMABLE = FARMABLE.concat(["vitearring","strearring","dexearring","intearring"]);
FARMABLE = FARMABLE.concat(["dexamulet","intamulet"]);
FARMABLE = FARMABLE.concat(["candy0","candy1","pvptoken"]);
FARMABLE = FARMABLE.concat(["wbook0"]);
FARMABLE = FARMABLE.concat(["vitscroll","scroll0","scroll1"]);
FARMABLE = FARMABLE.concat(["lostearring","rattail"]);
FARMABLE = FARMABLE.concat(["gemfragment"]);
// Previously in Farmable: stramulet


// This won't sell at item.level >=2  (via method sell_all_trash)
var TRASH = ["stinger", "hpbelt"]; //, "smoke"]; // ringsj // hpamulet
TRASH = TRASH.concat(["gloves1","coat1","helmet1","shoes1","pants1"]);
TRASH = TRASH.concat(["wbasher","claw","sword"]);
TRASH = TRASH.concat(["phelmet","gphelmet"]);   // expensive
TRASH = TRASH.concat(["pmaceofthedead"]);  // NPC sale for ~480k
TRASH = TRASH.concat(["throwingstars"]); // Needed for fiery throwing stars
// TRASH = TRASH.concat(["maceofthedead","staffofthedead","swordofthedead"]);
// TRASH = TRASH.concat(["stramulet"]);

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
	try { load_code("comms"); }    			catch(err) { Logger.log("Error loading comms: "+err); }
	try { load_code("missions_control"); }  catch(err) { Logger.log("Error loading missions_control: "+err); }  
	try { load_code("missions"); }    		catch(err) { Logger.log("Error loading missions: "+err); }  
	try { load_code("vendor_aldata"); }    	catch(err) { Logger.log("Error loading vendor_aldata: "+err); }  
	try { load_code("utils_api"); }    		catch(err) { Logger.log("Error loading utils_api: "+err); }  
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
	// load_code("gui_command_center");
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


// show_json( get("cache_aldata_engaged_events") )
var ALDATA_EVENTS_LIVE_KEY = "cache_aldata_live_events";
var ALDATA_EVENTS_ENGAGED_KEY = "cache_aldata_engaged_events";

game_log("Finished load_code( utils_init )");
