game_log("Loading init (1)");


const NameRanger = "Terranger";
const NamePriest = "NoHeals4U";
const NameWarrior = "Terazarrior";
const NameMerchant = "CurvyMoney";

const LEADER = NameWarrior;
const SLAVES = [NameRanger, NamePriest];
const VALS_TOONS = ["AlextheGreat"]


// Load utility functions (potions..)
load_code("use_items"); 
load_code("farming"); 
load_code("utils"); 
load_code("utils_events"); 

var init_comms = false;
load_code("comms");

if (character.name == LEADER) {
	// Load GUI modulse
	load_code("gui_minimap"); 
	load_code("gui_codecost");
	load_code("gui_render_party");
	load_code("gui_command_center");

	// Load slave toons
	start_chars(); 
	setInterval(start_chars, 15000);
}
if (character.name == NameMerchant) {
	load_code("gui_command_center");
}

setInterval(party_up, 2000);
