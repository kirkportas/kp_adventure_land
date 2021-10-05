/*
Draft mission overview for merchant.
High-level
*/

var STATE_ACTIVE = "active";
var STATE_DONE = "done";

class Location {
    constructor(x, y, mapname) {
        this.x = x;
        this.y = y;
        this.map = mapname;
    }
}

// let mc = new MissionControl();
// mc.init()
class MissionControl {
    constructor() {
        this.q = []; // queue
        this.intervals = [];

        this.update_last_cycle();
    }

    // For "standard" missions
    init() {
        let missions = [];
        missions = missions.concat([FishingMission, MiningMission]);
        missions.push(GoHomeMission);
        missions.push(HandleCompoundablesMission);
        // missions.push(DepositEverythingMission);

        for (let m of missions) {
            this.addMission(new m());
        }
    }

    run_missions() {
        this._scan_for_missions();
        this.intervals.push( setInterval(this._run_missions.bind(this), 1000) );
        this.intervals.push( setInterval(this._scan_for_missions.bind(this), 15000) );

        // Occasional sort for robustness.
        this.intervals.push( setInterval(this.sort.bind(this), 30000) );

        setTimeout(this.reset.bind(this), 45*60*1000); // 45 minute reset
    }

    missionExists(mName) {
        return this.q.filter(m => m.name == mName).length > 0;
    }

    getCurrentMission() {
        return this.q[0];
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

    update_last_cycle() {        
        // todo coded while hazy. Likely buggy
        let last_cycle_key = "mission_last_cycle";
        if (!get(last_cycle_key)) {
            set(last_cycle_key, Date.now());
        }

        this.last_cycle = Date.now();
        set(last_cycle_key, this.last_cycle);
    }

    sort() {
        this.q.sort(function(m1,m2) {
            if (m1.priority < m2.priority) { return -1 };
            if (m1.priority > m2.priority) { return 1 };
            return 0;
        });
    }
    
    // Unused for now
    reset() {
        this.q = [];
        for (let interval of this.intervals) {
            clearInterval(interval);
        }
        this.intervals = [];
        this.init();
        this.run_missions();
    }
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

    /* Fishing and Mining ****************************************************/
    if (!("fishing" in parent.next_skill)) {
        this.addMission(new FishingMission());
    }
    if (!("mining" in parent.next_skill)) {
        this.addMission(new MiningMission());
    }

    /* Item Collection    ****************************************************/
    // todo Perform Gon a timer to ensure mluck uptime

    // If not currently handlingcompoundables, deposit everything to the bank
    if (character.esize < 24 && this.getCurrentMission().name != "HandleCompoundables") {
        this.addMission(new TrashCompoundMission()); 
        this.addMission(new DepositEverythingMission()); 
        // this.addMission(new DepositFarmablesMission()); 
    }

    for (let charObj of onlineChars()) {
        if (charObj.name == character.name) { continue; }

        let inv_cache_key = "cache_inventory_"+charObj.name;
        let char_inv_cache = get(inv_cache_key);
        if (!char_inv_cache) {
            Logger.log("Error reading character inv cache for: "+charObj.name);
        }
        // let char_items = char_inv_cache.items;
        let char_esize = char_inv_cache.esize;

        let empty_space_threshold = 15; // High for testing. Lower to ~10/15
        if (char_esize < empty_space_threshold) { 
            game_log("Adding collectItems mission for "+charObj.name);
            Logger.log("Adding collectItems mission for "+charObj.name);

            this.addMission(new CollectItemsMission(charObj.name)); 
        }
    }

    /* Cleanup/Robustness ****************************************************/
    let cycle_time = 10*60*1000; // 10 minutes
    if ((Date.now() - this.last_cycle) > cycle_time) {
        this.addMission(new DepositEverythingMission());
        this.addMission(new HandleCompoundablesMission());
        this.sort();
        this.update_last_cycle();
    }
    // todo bank items mission

    // todo scan bank and upgrade/compount mission
}

MissionControl.prototype.cleanup = function() {
    if (this.q.length == 0) { return; } // error Cannot read properties of undefined
    
    for (let m of this.q) {
        if (m.status == STATE_DONE) {
            let index = this.q.indexOf(m);
            if (index > -1) {
              this.q.splice(index, 1);
              Logger.log("Mission Done: "+m.name);
            }
        }
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

    if (this.location_idx && this.locations) {
        this.location = this.locations[this.location_idx];
    }

    if (character.map != this.location.map) {
        smart_move(this.location);
        return true;
    } else if (distance(character, this.location) > 100) {
        if (!is_in_town() && character.map == "main" && this.location == LOCATION_TOWN) {
            use_skill("use_town");
        } else {
            smart_move(this.location);
        }
        return true;
    }
    return false;
  }

    cancel() {
        this.status = STATE_DONE;
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
    "HandleCompoundables": 6,
    "DepositEverything": 5,   // On boot or to reset. deposit all but a whitelist
}
/*****************************************************************************/

var LOCATION_TOWN = new Location(-207, -108, "main")
var LOCATION_BANK = new Location(0, -176, "bank")

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

    this.runCount = 15;
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

    this.runCount--;
    if (this.runCount <= 0) { this.cancel(); }

    setTimeout( this.cancel, 10000 );
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
    this.location = new Location(500, 1100, "main"); // bees
    // this.update_location();

    this.runCount = 10;
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
        this.runCount--;
        if (this.runCount <= 0) {
            Logger.log("Unable to run mission "+this.name);
            game_log("Unable to run, cancelling "+this.name);
            this.cancel();
        }
        return;
    }

    // TODO Update to check cache of other players.
    // Bee farming is on US PVP - Oct 4 2021
    // let myServer = parent.server_region + parent.server_identifier;
    // if (myServer != this.charObj.server) {
    if (parent.server_region != "US" || parent.server_identifier != "PVP") {
        change_server("US","PVP");
    }

    // Move if needed
    this.update_location();
    if (this.move_to_location()) { return }

    // Demand items from everyone. Dont spam it
    if (this.runCount >= 7) {
        give_items_wip();
    }

    // Run for ~10 seconds
    this.runCount--;
    if (this.runCount <= 0) {
        this.cancel();
    }
    // let char_inv_cache = get("cache_inventory_"+this.charname);
    // let char_esize = char_inv_cache.esize;
    // if (char_esize > 28 || character.esize < 5) { 
    //     this.cancel()
    //     game_log(`Mission Complete ${this.name}`);
    // }

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
        // game_log("cached_loc.map: " + cached_loc.map);
        this.location = new Location (cached_loc.x, cached_loc.y, cached_loc.map);
    } else if(distance_to_entity(entity) > 250) {
        // game_log("entity.map: " + entity.map);
        this.location = new Location(entity.x, entity.y, entity.map);
    }

    return;
  }
}

/*****************************************************************************/

class HandleCompoundablesMission extends Mission {
    /* 
    Go to bank, check for compoundables, retrieve them
    Go to town, wait for upgrades.
    Deposit remaining items in bank
    */
    constructor() {
        let name = "HandleCompoundables";
        let prio = MISSION_PRIORITY[name];
        super(name, prio); 

        // Todo Consider logic for multi-location missions
        this.locations = [LOCATION_BANK, LOCATION_TOWN];
        this.location_idx = 0;

        this.verbose = true;
        this.toDeposit = new Set(FARMABLE.concat(COMPOUNDABLE));
        this.startTimeMs = undefined;
    }

  // Check if fishing rod in mainhand or inventory.
    can_run() { 
        return true;
    }

    run() {
        if (!this.startTimeMs) { this.startTimeMs = Date.now(); }

        if (this.verbose) Logger.log(`${this.name} Run()`);
        if (!this.can_run()) {
            Logger.log("Unable to run mission "+this.name);
            return;
        }

        // Move if needed
        if (this.move_to_location()) { return; }

        if (this.retrieve()) { return; }
        this.location_idx = 1;

        // wait
        if (!inv_has_compoundable_trio()) {
            this.cancel();
        }

    }

    retrieve() {
        Logger.log("this._retrieve_done: "+this._retrieve_done);
        if (this._retrieve_done == false) {
            Logger.log("this._retrieve_done is set: "+this._retrieve_done);
            return this._retrieve_done;
        }
        if (!is_in_bank()) { game_log("retrieve() called out of bank - BAD"); }
        let items_to_retrieve = bank_get_compoundables_count();
        show_json(items_to_retrieve);
        /* 
        [{
            "packname": "items0",
            "idx": 22             },..]
        */
        let i = 20;
        for (let packinfo of items_to_retrieve) {
            // limit code calls
            if (i>0) {
                bank_retrieve(packinfo.packname, packinfo.idx);
                i--;
            }
        }
        if (i==0 || character.esize == 0 || items_to_retrieve) {
            this._retrieve_done = false;
        } else {
            this._retrieve_done = true;
        }
        return this._retrieve_done;
    }

    deposit() {
        // Store all farmable items
        for(let i=0;i<42;i++) {
            if(character.items[i]) {
                let name = character.items[i].name;
                if (this.toDeposit.has(name)) {
                    bank_store(i);
                }
            }
        }
    }

    move_to_location() {
        this.location = this.locations[this.location_idx];
        return super.move_to_location();
    }
}

/*****************************************************************************/

class DepositEverythingMission extends Mission {
  constructor() {
    let name = "DepositEverything";
    let prio = MISSION_PRIORITY[name];
    super(name, prio); // This should be a unique name?

    // Go to town first to auto sell
    this.locations = [LOCATION_TOWN, LOCATION_BANK];
    this.location_idx = 0;
    this.location = this.locations[0];

    this.verbose = true;
    this.whitelist = new Set(["hpot0","mpot0","stand0","rod","pickaxe"]);

    this.runCount = 0;
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
    if (this.move_to_location()) { return } // Town
    
    // Upgrade/combine for X seconds
    if (this.runCount > 0) {
        if (character.q.compound || character.q.upgrade) {
            this.runCount++;
        } else {
            this.runCount--;
        }
        return;
    }

    this.location_idx = 1;
    if (this.move_to_location()) { return } // Bank

    // Store almost all items
    for(let i=0;i<42;i++) {
        if(character.items[i]) {
            let name = character.items[i].name;
            if (!this.whitelist.has(name) && !name.includes("scroll")) {
                bank_store(i);
            }
        }
    }
    this.cancel();
  }
}

/*****************************************************************************/

class DepositFarmablesMission extends Mission {
  constructor() {
    let name = "DepositFarmable";
    let prio = MISSION_PRIORITY[name];
    super(name, prio); // This should be a unique name?

    this.location = LOCATION_BANK;
    this.verbose = true;

    this.runCount = 0;
    this.toDeposit = new Set(FARMABLE.concat(COMPOUNDABLE));
  }

  // Check if fishing rod in mainhand or inventory.
  can_run() { 
    return true;
  }

  run() {
    // super.run();
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

    // Cancel if stuck. May happen if inv is full of other items.
    // Rely on a DepositEverything mission to recover.
    this.runCount++;
    if (this.runCount > 20) {
        this.cancel();
    }
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
    if(!character.c.mining) {
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