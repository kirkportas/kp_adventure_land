/*
 * Mission Control Architecture:
 *
 * "MissionControl" 
     -> Maintains a queue of "Missions", each with a priority value.
     -> Regularly scans for certain conditions and creates Missions if needed. `MC._scan_for_missions()`
        -> For example, if a fighter's inventory is low, we generate a CollectItems mission.
     -> On a quick interval (1second), MC selects the top-priority mission, M, and calls "M.run()".

 * "Mission"
     -> A set of one or more Locations and one or more actions tied to each location.
     -> Invoked with a standardized "run()" method.
     -> Run() will handle movement to locations, actions at a location, and progress 

 * FAQ
    Q1: How do I "pause" a mission to do something more important? (e.g. fight a boss)
    A1: Add a higher priority mission to the queue, this is done in the `_scan_for_missions()` method.

 * Likely Plans:
    - Extend Missions to maintain their own set of subtasks.
    --- This would allow for robustness improvements like "restock potions" if Merchant deliveries fail.
    --- Will prevent over-reliance on the top-level Missions queue `MissionControl.q`.
 *
 */

/* Lower numbers are higher priority.
 * i.e. 1 is higher priority than 20   */
const MISSION_PRIORITY = {
    "ClearPVPItems": 3,       // If holding a PVP flagged item, deposit it to clear PVP flag.
    "Dismantle": 4,
    "DepositEverything": 5,   // On boot or to reset. deposit all but a whitelist
    "HandleCompoundables": 6, // Get compoundable items from the bank and compound
    "HandleUpgradeables": 6,  // Get upgradeable items from the bank and upgrade
    "Mining": 15,
    "Fishing": 15,
    "Exchange": 16,           // Visit Xyn and exchange
    "TrashCompound": 20,
    "DepositFarmable": 22,    // Deposit items marked as "Farmable"
    "collect_items_": 25,     // Visit a fighter and get items from them
    "GoHome": 900,            // Default behavior
}

class Location {
    constructor(x, y, mapname) {
        this.x = x;
        this.y = y;
        this.map = mapname;
    }
}

/*****************************************************************************/

var LOCATION_TOWN = new Location(-207, -108, "main");
var LOCATION_BANK = new Location(0, -176, "bank");
var LOCATION_DISMANTLE = new Location(0, 540, "main");
var STATE_ACTIVE = "active";
var STATE_DONE = "done";


// let mc = new MissionControl();
// mc.init()
class MissionControl {
    constructor() {
        this.q = []; // queue
        this.intervals = [];
        this.esize_alert = 8;

        this.update_last_cycle();
    }

    // For "standard" missions
    init() {
        let missions = [];
        missions = missions.concat([FishingMission, MiningMission]);
        missions.push(GoHomeMission);
        // missions.push(HandleUpgradeablesMission);
        // missions.push(HandleCompoundablesMission);
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
    
    // Runs on a long interval, as a recovery mechanism
    // Todo, would likely be more robust to just trigger a page reload
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
        if (top_mission.status == STATE_DONE) {
            this._run_missions();
        }
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
    if (character.esize <= this.esize_alert 
        && this.getCurrentMission().name != "HandleCompoundables"
        && this.getCurrentMission().name != "HandleUpgradeables") {
            this.addMission(new TrashCompoundMission()); 
            this.addMission(new DepositEverythingMission()); 
            // this.addMission(new DepositFarmablesMission()); 
    }

    for (let charObj of onlineChars()) {
        if (charObj.name == character.name) { continue; }

        let inv_cache_key = "cache_inventory_"+charObj.name;
        let char_inv_cache = get(inv_cache_key);
        if (!char_inv_cache || !char_inv_cache.items) {
            Logger.log("Error reading character inv cache for: "+charObj.name);
            continue;
        }

        // let candy_count = char_inv_cache.items.filter(item =>
        //     item && item.name.includes("candy")
        // ).length;
        // if (candy_count > 0) {
        //     this.addMission(new CollectItemsMission(charObj.name)); 
        // }

        let char_esize = char_inv_cache.esize;
        let empty_space_threshold = 28; // High for testing. Lower to ~10/15
        if (char_esize < empty_space_threshold) { 
            game_log("Adding collectItems mission for "+charObj.name);
            Logger.log("Adding collectItems mission for "+charObj.name);

            this.addMission(new CollectItemsMission(charObj.name)); 
        }
    }

    // Scan for missions based on items currently held in inventory
    let pvpflag_skipped_items = ["beewings"];
    var holding_pvp_item = false;
    var holding_dismantle_item = false;

    for(let i=0;i<42;i++) {
        let item = character.items[i];
        if (!item || !item.name) continue;

        // PVP Flag Mission
        if("v" in item && !pvpflag_skipped_items.includes(item.name)) {
            holding_pvp_item = true;
        }

        // Dismantle Mission
        if (this.getCurrentMission().name != "Exchange"
            && DISMANTLE_ITEMS.includes(item.name)
            && item.level == 0) {
                holding_dismantle_item = true;
        }

        // Exchange mission
        if (EXCHANGEABLES.includes(item.name)) {
            this.addMission(new ExchangeMission());
        }

    }

    if (holding_pvp_item) this.addMission(new ClearPVPItemsMission());
    if (holding_dismantle_item) this.addMission(new DismantleMission());

    /* Cleanup/Robustness ****************************************************/
    let cycle_time = 10*60*1000; // 10 minutes
    if ((Date.now() - this.last_cycle) > cycle_time) {
        this.addMission(new DepositEverythingMission());
        this.addMission(new HandleCompoundablesMission());
        this.addMission(new HandleUpgradeablesMission());
        this.sort();
        this.update_last_cycle();
    }
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

    this.esize_alert = 8; // Must match MissionControl
    this.verbose = true; // Memory.verbose.claim ? true : false;
  }

  // Supports only a single location.
  move_to_location() {
    if (is_moving(character)) return true;
    if (this.location_idx != undefined && this.locations != undefined) {
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
