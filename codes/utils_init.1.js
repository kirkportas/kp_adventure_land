
game_log("Loading init (1)");


// Load utility functions (potions..)
load_code("use_items"); 
load_code("farming"); 
load_code("utils"); 

const LEADER = "Terazarrior";
const SLAVES = ["Terranger","NoHeals4U"];
INIT_COMPLETE = false;


setInterval(party_up, 2000);

start_chars(); setInterval(start_chars, 15000);

// called by the inviter's name - request = someone requesting to join your existing party
function on_party_request(name) 
{
	if (SLAVES.includes(name)) { 
		accept_party_request(name);
	}
}


