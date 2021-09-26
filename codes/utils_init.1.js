// Line 1. Note that this file only runs once.
set_message("Start!");

load_code("Logger");
Logger._.init();
Logger.ACTIVE=true;
game_log("LOGGER INACTIVE");


Logger.functionEnter("Loading utils_init");


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
const NameMerchant = "CurvyMoney";
const NameMage = "Terakazam";
// For console pasting: ["Terazarrior","NoHeals4U","Terranger"]

const LEADER = NameWarrior;

// var SLAVES = [NameRanger, NamePriest];    // **********************
const SLAVES = [NameRanger, NameMage, NamePriest];
const ACTIVE_PARTY = [NameRanger, NamePriest];

// Val's characters 
const NameValWarrior = "AlextheGreat";
const NameValMage = "LadyMary";
const NameValMerchant = "LeglyBlonde";
const VALS_TOONS = [NameValWarrior, NameValMage, NameValMerchant];

// Val's leader. (Overwrite values for Kirk if Val is using the code)
if (character.name == NameValWarrior) {
	LEADER = NameValWarrior;
	SLAVES = [NameValMage, NameValMerchant];
}

// Used for verifying that the requested is "friendly" for party requests
const ALLTOONS = [NameWarrior, NameRanger, NamePriest, NameMage, NameMerchant,
				  NameValWarrior, NameValMage, NameValMerchant];

// Misc constants
const PONTY_KEY = "ponty_items_to_buy";


// Configure upgrade/compound actions
const max_level_upgrade = 3; // Only used for a GUI function (intended for lowlevel)
const UPGRADEABLE_LEVELS = {
	// Wanderers
	"wcap": 6,
	"wgloves": 7,
	"wbreeches": 6,
	"wshoes": 5,
	"wattire": 3,
	"wshield": 7,

	// T2
	"shield": 5,

	// Misc
	"slimestaff": 7,
	// "stinger": 5,     // Maybe trash
	
	// Rugged
	"pants1": 5,       //RuggedPants
	"coat1": 5,
	"shoes1": 5,
	"helmet1": 5,
	"gloves1": 5,

	// Weapons
	"pmace": 5,
};

const max_level_compound = 2;
game_log("max_level_compound: "+max_level_compound);
var COMPOUNDABLE = ["hpamulet","ringsj","hpbelt","wbook0"];
COMPOUNDABLE=COMPOUNDABLE.concat(["vitamulet","stramulet","intamulet","dexamulet"]);
COMPOUNDABLE=COMPOUNDABLE.concat(["vitearring","strearring","intearring","dexearring"]);

// const COMPOUNDABLE_LEVELS = {
// 	"strearring": 6,
// 	"wcap": 6,
// };

// Default all shop items to lvl 6 (to help clear out inventory)
const shop_items = ["helmet","shoes","gloves","pants","coat", "bow","blade","staff","wshield"];
for (itemname of shop_items) {
	UPGRADEABLE_LEVELS[itemname] = 7;
} 

const UPGRADEABLE = Object.keys(UPGRADEABLE_LEVELS);

var LOW_CRAFT_ITEMS = ["gslime","crabclaw","beewings","seashell","bwing","snakeoil","snakefang","spores","whiteegg"];
var FARMABLE = ["gem0"];
FARMABLE = FARMABLE.concat(LOW_CRAFT_ITEMS);
FARMABLE = FARMABLE.concat(["vitearring","strearring","dexearring","intearring"]);
FARMABLE = FARMABLE.concat(["vitamulet","stramulet","dexamulet","intamulet"]);
FARMABLE = FARMABLE.concat(["candy0","candy1"]);
FARMABLE = FARMABLE.concat(["stinger","wbook0"]);
FARMABLE = FARMABLE.concat(["vitscroll","scroll0","scroll1"]);

// TRASH = []; 
var TRASH = ["stinger"];

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
	// try { load_code("comms"); }    			catch(err) { Logger.log("Error loading comms: "+err); } 
Logger.functionExit("Loading shared code files", 0);

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
	start_chars(); 
	setInterval(start_chars, 15000);
}

if (character.name == NameValMerchant) {
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


game_log("Finished load_code( utils_init )");
