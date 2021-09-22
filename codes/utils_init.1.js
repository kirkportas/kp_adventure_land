// Line 1. Note that this file only runs once.
set_message("Start!");

load_code("Logger");
Logger._.init();
Logger.ACTIVE=true;
game_log("LOGGER INACTIVE");


Logger.functionEnter("Loading utils_init");


const LOADGUI = false;
const LOADSLAVES = true;

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
const SLAVES = [NameRanger, NameMage];

// Used for verifying that the requested is "friendly" for party requests
const ALLTOONS = [NameWarrior,NameRanger, NamePriest, NameMage];
const VALS_TOONS = ["AlextheGreat"];

// Val's characters 
const NameValWarrior = "AlextheGreat";
const NameValMage = "LadyMary";


// Val's leader. (Overwrite values for Kirk if Val is using the code)
if (character.name == NameValWarrior) {
	LEADER = NameValWarrior;
	SLAVES = [NameValMage];
}

// Configure upgrade/compound actions
const max_level_compound = 3;
const max_level_upgrade = 3; // Only used for a GUI function (intended for lowlevel)
const COMPOUNDABLE = ["hpamulet","ringsj","hpbelt","wbook0"];

const UPGRADEABLE_LEVELS = {
	"wshoes": 6,
	"wcap": 6,
	"wgloves": 5,
	"wattire": 3,
	"slimestaff": 7,
	// "stinger": 5,     // Maybe trash
	"pants1": 5       //RuggedPants
};
// Default all shop items to lvl 6 (to help clear out inventory)
const shop_items = ["helmet","shoes","gloves","pants","coat", "bow","blade","staff"];
for (itemname of shop_items) {
	UPGRADEABLE_LEVELS[itemname] = 6;
} 

const UPGRADEABLE = Object.keys(UPGRADEABLE_LEVELS);
const FARMABLE = ["crabclaw","beewings","seashell","gem0", "stinger","bwing","wbook0","snakeoil"];
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

if (character.name == NameMerchant) {
	load_code("gui_command_center");
}

Logger.functionExit("Loading utils_init", 0);
Logger.logPrintStack();

// GUI Customizations one-offs
// Widen the game log area
parent.$('#gamelog').css({'width':'450px'});
