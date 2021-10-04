/*
Draft mission overview for merchant.


High-level

"GetInventoryOfBank"

"GetBankItemLocsForAllCompoundables"
- GoToBank
- ReadAllBankItems

*/
/* 


*/
var STATE_ACTIVE = "active";
var STATE_DONE = "done";


// let mc = new MissionControl();
// mc.init()
class MissionControl {
    constructor() {
        this.q = []; // queue
        this.intervals = [];
    }

    // For "standard" missions
    init() {
        let missions = [FishingMission, MiningMission, GoHomeMission];

        for (let m of missions) {
            this.q.push(new m());
        }
    }

    run_missions() {
        this._scan_for_missions();
        this.intervals.push( setInterval(this._run_missions.bind(this), 1000) );
        this.intervals.push( setInterval(this._scan_for_missions.bind(this), 15000) );
    }

    missionExists(mName) {
        return this.q.filter(m => m.name == mName).length > 0;
    }

    addMission(m) {
        if (!this.missionExists(m.name)) {  
            this.q.push(m);
            this.sort();
            use_skill("stop");
        } else {
            game_log("Mission already exists: "+m.name);
        }
    }

    sort() {
        this.q.sort(function(m1,m2) {
            if (m1.priority < m2.priority) { return -1 };
            if (m1.priority > m2.priority) { return 1 };
            return 0;
        });
    }
    
    // Unused for now
    // reset() {
    //  for (interval of this.intervals) {
    //      clearInterval(interval);
    //  }
    // }
}

MissionControl.prototype._run_missions = function() {
    if (this.q.length == 0) { return; } // error Cannot read properties of undefined
    let top_mission = this.q[0];

    if (top_mission.status == STATE_DONE) {
        Logger.log("Mission state DONE -> "+top_mission.name);
        this.q.shift();
        this._run_missions();
    } else {
        top_mission.run();
        // this.cleanup();
    }
}

MissionControl.prototype._scan_for_missions = function() {
    if (!"fishing" in parent.next_skill) {
        this.addMission(new FishingMission());
    }
    if (!"mining" in parent.next_skill) {
        this.addMission(new MiningMission());
    }

    // todo Perform Go collect items mission on a timer to ensure mluck uptime
    for (charObj of onlineChars()) {
        if (charObj.name == character.name) { continue; }

        let inv_cache_key = "cache_inventory_"+charObj.name;
        let char_inv_cache = get(inv_cache_key);
        if (!char_inv_cache) {
            Logger.log("Error reading character inv cache for: "+charObj.name);
        }
        // let char_items = char_inv_cache.items;
        let char_esize = char_inv_cache.esize;
        if (char_esize < 15) { 
            game_log("Adding collectItems mission for "+charObj.name);
            Logger.log("Adding collectItems mission for "+charObj.name);

            if (character.esize < 24) {
                this.addMission(new TrashCompoundMission()); 
                this.addMission(new DepositFarmablesMission()); 
            }
            this.addMission(new CollectItemsMission(charObj.name)); 
        }
    }
    // todo bank items mission

    // todo scan bank and upgrade/compount mission
}

MissionControl.prototype.cleanup = function() {
    if (this.q.length == 0) { return; } // error Cannot read properties of undefined
    
    for (m of this.q) {
        if (m.status == STATE_DONE) {
            let index = this.q.indexOf(m);
            if (index > -1) {
              this.q.splice(index, 1);
              Logger.log("Mission Done: "+m.name);
            }
        }
    }
}

class Location {
    constructor(x, y, mapname) {
        this.x = x;
        this.y = y;
        this.map = mapname;
    }
}

class Mission {
  constructor(name, priority) {
    this.name = name;
    this.startTimeMs = Date.now();
    this.priority = priority ? priority : 999; // Default low value.
    this.status = STATE_ACTIVE;

    // A mission should abort after a given time.
    this.maxRunTimeMs = 5*60*1000; // 5 minutes

    this.verbose = true; // Memory.verbose.claim ? true : false;
  }

  // Supports only a single location.
  move_to_location() {
    if (is_moving(character)) return true;
    if (character.map != this.location.map) {
        smart_move(this.location);
        return true;
    } else if (distance(character, this.location) > 3) {
        if (!is_in_town() && character.map == "main" && this.location.map == "main") {
            use_skill("use_town");
        } else {
            smart_move(this.location);
        }
        return true;
    }
    return false;
  }

  // Each mission must define its starting requirements
  can_run() { return false }
}

const MISSION_PRIORITY = {
    'GoHome': 900,
    "Mining": 15,
    "Fishing": 15,
    'TrashCompound': 20,
    'DepositFarmable': 22,
    'collect_items_': 25,
}
/*****************************************************************************/

var LOCATION_TOWN = new Location(-207, -108, "main")

// TODO get Compoundables / Upgradeables from bank and work on them

class GoHomeMission extends Mission {
  constructor() {
    let name = "GoHome"; 
    let prio = MISSION_PRIORITY[name];
    super(name, prio);

    this.location = LOCATION_TOWN;
    this.verbose = true;
  }

  can_run() { 
    return true;
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);
    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        return;
    }

    // Move if needed
    if (this.move_to_location()) { return }
  }

  // After Runtime or abort
  cancel() {
    this.status = STATE_DONE;
  }
}

/*****************************************************************************/

// Go to town location, wait 10 seconds to sell and compound
class TrashCompoundMission extends Mission {
  constructor() {
    let name = "TrashCompound";
    let prio = MISSION_PRIORITY[name];
    super(name, prio);

    this.location = LOCATION_TOWN;
    this.verbose = true;
  }

  can_run() { 
    return true;
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);
    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        return;
    }

    // Move if needed
    if (this.move_to_location()) { return }

    setTimeout( this.cancel(), 10000 )
  }

  // After Runtime or abort
  cancel() {
    this.status = STATE_DONE;
  }
}

/*****************************************************************************/
/*
show_json( 
    distance(
        character, 
        get_characters().filter(x=>x.name=="Terranger")[0] 
    ), false )

show_json( get_characters().filter(x=>x.name=="Terranger")[0] )
*/
class CollectItemsMission extends Mission {
  constructor(charname) {
    let prefix = "collect_items_";
    let name = prefix+charname;
    let prio = MISSION_PRIORITY[prefix];
    super(name, prio);

    this.charname = charname;
    this.charObj = onlineChars().filter(x=>x.name == charname);

    // TODO major bug. Calling update_location() doesn't update it and chokes
    // in the parent mission move_to_location() method
    this.location = new Location(500,1100,"main"); // bees
    // this.update_location();

    this.verbose = true;
  }

  // Only run a collect mission if we have free bag space
  can_run() { 
    return character.esize > 21;
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);
    // if (this.verbose) game_log(`${this.name} Location: ${this.location}`);

    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        return;
    }

    // TODO Update to check cache of other players.
    // Bee farming is on US PVP - Oct 4 2021
    let myServer = parent.server_region + parent.server_identifier;
    // if (myServer != this.charObj.server) {
    if (parent.server_region != "US" || parent.server_identifier != "PVP") {
        change_server("US","PVP");
    }

    // Move if needed
    this.update_location();
    if (this.move_to_location()) { return }

    // Demand items from everyone
    give_items_wip();

    // todo

    let char_inv_cache = get("cache_inventory_"+this.charname);
    let char_esize = char_inv_cache.esize;
    if (char_esize > 28 || character.esize < 5) { 
        this.cancel()
        game_log(`Mission Complete ${this.name}`);
    }

  }

  //show_json( get("cache_char_location_Terakazam" ))
  update_location() {
    let entity = get_entity(this.charname); 
    let cached_loc = get("cache_char_location_"+this.charname);

    if (!entity) {
        if (Date.now() - cached_loc.ts > 15000) {
            game_log("ERROR IN COLLECT ITEMS - Loc cache is outdated");
            this.cancel();
            return;
        }
        game_log("cached_loc.map: " + cached_loc.map);
        this.location = new Location (cached_loc.x, cached_loc.y, cached_loc.map);
    } else if(distance_to_entity(entity) > 250) {
        game_log("entity.map: " + entity.map);
        this.location = new Location(entity.x, entity.y, entity.map);
    }

    return;
  }

  // After Runtime or abort
  cancel() {
    this.status = STATE_DONE;
  }
}

class DepositFarmablesMission extends Mission {
  constructor() {
    let name = "DepositFarmable";
    let prio = MISSION_PRIORITY[name];
    super(name, prio); // This should be a unique name?

    this.location = new Location(0, -176, "bank");
    this.verbose = true;

    this.toDeposit = new Set(FARMABLE.concat(COMPOUNDABLE));
  }

  // Check if fishing rod in mainhand or inventory.
  can_run() { 
    return true;
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);
    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        return;
    }

    // Move if needed
    if (this.move_to_location()) { return }

    // Store all farmable items
    for(let i=0;i<42;i++) {
        if(character.items[i]) {
            let name = character.items[i].name;
            if (this.toDeposit.has(name)) {
                bank_store(i);
            }
        }
    }

    if (character.esize > 21) {
        this.cancel();
    }
  }

  // After Runtime or abort
  cancel() {
    // Teleport and/or smart_move to town.
    this.status = STATE_DONE;
  }
}

/*****************************************************************************/

class FishingMission extends Mission {
  constructor() {
    let name = "Fishing";
    let prio = MISSION_PRIORITY[name];
    super(name, prio); // This should be a unique name?

    this.location = new Location(-1370, 1400, "main");
    this.verbose = true;
  }

  // Check if fishing rod in mainhand or inventory.
  can_run() { 
    let can = !("fishing" in parent.next_skill);
    if (!can) this.cancel(); 
    // Check for rod 
    return can
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);
    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        return;
    }

    // Move if needed
    if (this.move_to_location()) { return }

    // equip fishing rod
    if (!character.slots["mainhand"] || !character.slots["mainhand"] == "rod") { 
        equip(locate_item("rod")); 
    }

    // Execute fishing action
    if(!character.c.fishing) {
        use_skill("fishing");
    }
  }

  // After Runtime or abort
  cancel() {
    // Teleport and/or smart_move to town.
    this.status = STATE_DONE;
  }

  stats() {

  }
}

/*****************************************************************************/

class MiningMission extends Mission {
  constructor() {
    let name = "Mining";
    let prio = MISSION_PRIORITY[name];
    super(name, prio); // This should be a unique name?

    this.location = new Location(280, -110, "tunnel");
    this.verbose = true;
  }

  // Check if fishing rod in mainhand or inventory.
  can_run() { 
    let can = !("mining" in parent.next_skill);
    if (!can) this.cancel(); 
    return can
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);
    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        return;
    }

    // Move if needed
    if (this.move_to_location()) { return }

    // equip pick
    if (!character.slots["mainhand"] || !character.slots["mainhand"] == "pickaxe") { 
        equip(locate_item("pickaxe")); 
    }

    // Execute fishing action
    if(!character.c.fishing) {
        use_skill("mining");
    }
  }


  // After Runtime or abort
  cancel() {
    // Teleport and/or smart_move to town.

    this.status = STATE_DONE;
  }

  stats() {

  }
}

game_log("Finished load_code( missions )");