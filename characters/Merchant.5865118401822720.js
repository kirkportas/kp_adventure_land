// Line 1
game_log("Loading Merchant char file");
load_code("utils_init", function(){ game_log("Error loading utils_init"); });

var attack_mode = true; // Just for use in fleeing.
setInterval(main, 1000/2); 
setInterval(scareLoop, 1000/3); 

// Location based - 0-time actions 
pontyPurchase();
joinGiveAways();
setInterval(pontyPurchase, 15000);
setInterval(joinGiveAways, 29000);
setInterval(getOutOfJail, 15000);

// Time-costly actions/missions
setInterval(serverLoop, 5*60*1000); // 5 minutes

// Stores event names only 
track_events();

// const CACHE_JAIL_KEY = "cache_jail_history";
function getOutOfJail() {
    if (character.in == "jail") {
        parent.socket.emit("leave");
    }
}

// Use this to do any custom or one-off stuff.
function custom_town_behavior() {
    // 1) Early-game: Get some/all shop items to lvl 9
    // manual_compound_items();
}

let missionControl = new MissionControl();
missionControl.init(); 
game_log("missionControl.q: " + missionControl.q);
missionControl.run_missions();

// Load Gui Buttons, this must be after MissionControl is initted.
load_code("gui_init");

function main(){
    start_ts = Date.now();
    Logger.functionEnter(logFnName);

    try {
        try {
            run_shared_executions();
            loot();
            use_potion();

            // Unequip to walk faster
            gear_check();

            if(character.rip) {
                Logger.functionExit(logFnName, 0);
                return;
            }
        } catch(err) {
            Logger.log("Error in merchant main loop - Basic executions");
            Logger.log(err);
        }


        try {
            if (is_in_town()) {
                sell_all_trash();
                compound_items();
                buy_potions();
                buy_scrolls();

                // Upgrade "common" items to a specified level (e.g. 7)
                merchant_handle_upgradeables("dexscroll");

                // For one-off actions
                custom_town_behavior();
            }
        } catch(err) {
            Logger.log("Error in merchant main loop - is_in_town executions");
            Logger.log(err);
        }

        try {
            // Store items in "items1", the 2nd from right in southern row. (Gabriella)
            if (is_in_bank()) {
                bank_store_craftables()
            }
        } catch(err) {
            Logger.log("Error in merchant main loop - is_in_bank executions");
            Logger.log(err);
        }

        try {
            // Cast Mluck if not cast, or <58 minutes remaining
            for (let charObj of onlineChars()) {
                let charName = charObj.name;
                var entity = parent.entities[charName];
                if (!entity) continue;

                if (is_in_range(entity, "mluck") && entity.s) {
                    if (!("mluck" in entity.s) || entity.s.mluck.ms < 58*60*1000) {
                        game_log("use_skill mluck: "+charName)
                        use_skill("mluck",entity);
                    }
                }
                // todo find distance for sending items
                if (distance(character, entity) < 300) {
                    give_potions(entity);
                }
            }
        } catch(err) {
            Logger.log("Error in merchant main loop - CharacterLoop executions");
            Logger.log(err);
        }

    } catch(err) {
        Logger.log("Unhandled Error in merchant main loop");
        Logger.log(err);

    } finally {
        // End main loop
        var runtime = Date.now()-start_ts;
        Logger.functionExit(logFnName,runtime);
        Logger.logPrintStack();
    }
};


function scareLoop() {
    let nearest_mon = get_nearest_monster();
    if (!nearest_mon) return;
    if (distance(character, nearest_mon) < 50) {
        use_skill("scare");
    }
}

function gear_check() {
    if (is_moving(character)) {
        if (character.slots["mainhand"] != null
            && character.slots["mainhand"].name != "vstaff") {
            unequip("mainhand");
        }
        let vstaff_idx = locate_item("vstaff");
        if (vstaff_idx >= 0) {
            equip(vstaff_idx);
        }
        close_booth();
    }
}

var servers = [["ASIA","I"],["US","I"],["US","II"],["US","III"],["US","PVP"],["EU","I"],["EU","II"],["EU","PVP"]];
servers.push(["US","PVP"]); // Todo, doubled up on us pvp for now
const SERVER_I_KEY = "server_i";
var server_i = get(SERVER_I_KEY) || 0;
function serverLoop() {
    if (!is_in_town()) { return; }

    server_i++;
    if (server_i > servers.length-1) { server_i = 0 };
    set(SERVER_I_KEY, server_i);

    let region = servers[server_i][0];
    let name = servers[server_i][1];
    game_log("Changing servers!");

    // Examples: change_server("EU","I") ("ASIA","PVP") or ("US","III")
    change_server(region, name);
}

