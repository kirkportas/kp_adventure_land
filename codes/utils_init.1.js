
load_code("Logger");
Logger._.init();
Logger.ACTIVE=true;

<<<<<<< Updated upstream
const TIMESTAMP_KEY = "ts-"+character.name;
set(TIMESTAMP_KEY, Date.now())


// Logger.functionEnter("2");
// Logger.log("test2");
// Logger.functionExit("2",0);
// Logger.logPrintStack();

Logger.functionEnter("Loading utils_init");
=======
// Kirk's characters
>>>>>>> Stashed changes
const NameRanger = "Terranger";
const NamePriest = "NoHeals4U";
const NameWarrior = "Terazarrior";
const NameMerchant = "CurvyMoney";
// For console pasting: ["Terazarrior","NoHeals4U","Terranger"]

<<<<<<< Updated upstream
const LEADER = NameWarrior;
const SLAVES = [NameRanger, NamePriest];
const ALLTOONS = [NameWarrior,NameRanger, NamePriest];
const VALS_TOONS = ["AlextheGreat"]
=======
// Val's characters 
const NameValWarrior = "AlextheGreat";
const NameValMage = "LadyMary";


// Used for verifying that the requested is "friendly" for party requests
const VALS_TOONS = ["AlextheGreat"];

// Kirk's leader
// if (character.name == NameWarrior) {
var LEADER = NameWarrior;
var SLAVES = [NameRanger, NamePriest];

// Val's leader. (Overwrite values for Kirk if Val is using the code)
if (character.name == NameValWarrior) {
	LEADER = NameValWarrior;
	SLAVES = [NameValMage];
}
>>>>>>> Stashed changes

const max_level_compound = 2;
const max_level_upgrade = 3;
const COMPOUNDABLE = ["hpamulet","ringsj","hpbelt"];
const UPGRADEABLE = ["wshoes"];
const UPGRADEABLE_LEVELS = {
	"wshoes": 7
}

set("give_items_"+NameWarrior, []);
set("give_items_"+NamePriest, []);
set("give_items_"+NameRanger, []);
// get("give_items")

// Load utility functions (potions..)
Logger.functionEnter("Loading shared code files");
	try { load_code("use_items"); } 	    catch(err) { Logger.log("Error loading use_items: "+err); }
	try { load_code("farming"); } 		    catch(err) { Logger.log("Error loading farming: "+err); }
	try { load_code("utils"); } 		    catch(err) { Logger.log("Error loading utils: "+err); }
	try { load_code("utils_events"); } 	    catch(err) { Logger.log("Error loading utils_events: "+err); }
	try { load_code("utils_movement"); }    catch(err) { Logger.log("Error loading utils_movement: "+err); } 
	var init_comms = false;
	try { load_code("comms"); }    			catch(err) { Logger.log("Error loading comms: "+err); } 
Logger.functionExit("Loading shared code files", 0);

<<<<<<< Updated upstream
if (character.name == LEADER) {
	Logger.functionEnter("Loading LEADER files");
	try {
		// Load GUI modules
		load_code("gui_minimap"); 
		load_code("gui_codecost");
		load_code("gui_render_party");
		load_code("gui_command_center");
		// Logger.log("Gui ended");
	} catch(err) { Logger.log("Error loading GUI: "+err); } 
	Logger.functionExit("Loading LEADER files", 0);
=======
// Val
if (character.name == NameValWarrior) {
	load_code("gui_minimap"); 

	// Load slave toons
	start_chars(); 
	setInterval(start_chars, 15000);
}

// Kirk
if (character.name == NameWarrior) {
	// Load GUI modulse
	load_code("gui_minimap"); 
	load_code("gui_codecost");
	load_code("gui_render_party");
	load_code("gui_command_center");
>>>>>>> Stashed changes

	// Load slave toons
	Logger.functionEnter("Starting slaves");
	start_chars(); 
	setInterval(start_chars, 15000);
	Logger.functionExit("Starting slaves", 0);
}
if (character.name == NameMerchant) {
	load_code("gui_command_center");
}

Logger.functionExit("Loading utils_init", 0);
Logger.logPrintStack();