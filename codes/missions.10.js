/*
 * Merchant-focused Mission live here.
 * For description of Mission architecture see missions_control.12.js
 */

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

// Go to town location, clear trash from bank
class TrashCompoundMission extends Mission {
    constructor() {
        let name = "TrashCompound";
        let prio = MISSION_PRIORITY[name];
        super(name, prio);
        
        this.locations = [LOCATION_TOWN, LOCATION_BANK];
        this.location_idx = 0;
        this.location = this.locations[this.location_idx];
        this.verbose = true;

        this._retrieve_done = false;

        this.runCount = 15;

        // List item names to sell for "smart" cases
        // Example: Sell the 3rd stack of 9999 beewings
        this.smart_sell_items = [];
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
        if (this.move_to_location()) { return } // Town
        if (character.q.compound || character.q.upgrade) { return; }
        this.location_idx = 1;
        if (this.move_to_location()) { return } // Bank
        if (this.retrieve()) { return; }
        this.location_idx = 0;
        if (this.move_to_location()) { return } // Town

        this.runCount--;
        if (this.runCount <= 0) { this.cancel(); }

        setTimeout( this.cancel, 10000 );
    }

    retrieve() {
        Logger.log("this._retrieve_done: "+this._retrieve_done);
        if (this._retrieve_done === true) {
            Logger.log("this._retrieve_done is set: "+this._retrieve_done);
            return this._retrieve_done;
        }
        if (!is_in_bank()) { game_log("retrieve() called out of bank - BAD"); }

        let items_to_retrieve = bank_get_trash();
        if (items_to_retrieve.length == 0) {
            this.cancel();
            return;
        }
        /*  [{ "packname": "items0",  "idx": 22 },..] */

        // Todo smart handling
        // let smart_items_to_retrieve = bank_get_trash_smart();

        // limit code calls to 20
        let i = 20;
        for (let packinfo of items_to_retrieve) {
            if (i>0) {
                bank_retrieve(packinfo.packname, packinfo.idx);
                i--;
            }
        }

        // Todo this is probably buggy.
        if (i==0 || character.esize == 0 || items_to_retrieve) {
            this._retrieve_done = false;
        } else {
            this._retrieve_done = true;
        }
        return this._retrieve_done;
    }

}

/*****************************************************************************/

class ExchangeMission extends Mission {
  constructor() {
    let name = "Exchange";
    let prio = MISSION_PRIORITY[name];
    super(name, prio);

    this.location = LOCATION_EXCHANGE;
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
    if (this.move_to_location()) { return; }

    if (character.q.exchange) { return; }

    let exchangeables = ["candy1","candy0","gem0","mysterybox","armorbox"];
    for (let itemname of exchangeables) {
        let idx = locate_item(itemname);
        if (idx >= 0) {
            exchange(idx);
            return;
        }
    }
    this.cancel();

  }
}

/*****************************************************************************/

// Intended for dismantling "ofthedead" items to get mummybones
class DismantleMission extends Mission {
  constructor() {
    let name = "Dismantle";
    let prio = MISSION_PRIORITY[name];
    super(name, prio);

    this.location = LOCATION_DISMANTLE;
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
    if (this.move_to_location()) { return; }

    // Keep daggers of the dead
    var have_items = false;
    for (let itemname of DISMANTLE_ITEMS) {
        idxs = locate_items(itemname);
        for (let idx of idxs) {
            let item = character.items[idx];

            // Only dismantle level 0 items
            if (item.level > 0) continue;

            have_items = true;
            if (idx >= 0) {
                dismantle(idx);
                return;
            }   
        }
    }

    if (!have_items) this.cancel();
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
    this.charObj = onlineChars().filter(x=>x.name == charname)[0];

    this.update_location();

    this.runCount = 10;
    this.verbose = true;
  }

  // Only run a collect mission if we have free bag space
  can_run() { 
    // Don't leave the main map
    let can = character.esize > this.esize_alert-1;
    // can = can && this.location && this.location.map == "main";
    return can;
  }

  move_to_location() {
    if (["Terazarrior","Terrogue"].includes(this.charname)) {
        if (!get_nearest_monster("mrgreen") && !get_nearest_monster("mrpumpking")) {
            request_magiport_to_boss();
        }
    }
    super.move_to_location();
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);

    if (this.runCount <= 0) {
        Logger.log("cancelling mission, this.runCount <= 0");
        this.cancel();
    }

    if (!this.can_run()) {
        Logger.log("Unable to run mission "+this.name);
        this.priority++;
        this.runCount--;
        if (this.runCount <= 0) {
            Logger.log("Unable to run mission "+this.name);
            game_log("Unable to run, cancelling "+this.name);
            this.cancel();
        }

        this.cancel(); // todo. Just cancel until server swapping is available for this mission
        return;
    }
    // todo hack for server hopping

    if (!is_same_server_as_charObj(this.charObj)) {
        let name, region;
        if (this.charObj.server == "ASIAI") {
            change_server("ASIA","I");
        } else {
            name = this.charObj.server.slice(0,2);
            region = this.charObj.server.slice(2,999);
            change_server(name,region);
        }
    }

    // if (this.charObj.server && this.charObj.server != "USPVP") {
    //     this.cancel();
    //     Logger.log("cancelling mission, server not USPVP");
    //     Logger.log(this.charObj.server);
    // }

    // TODO Update to check cache of other players.
    // Bee farming is on US PVP - Oct 4 2021
    // let myServer = parent.server_region + parent.server_identifier;
    // if (parent.server_region != "US" || parent.server_identifier != "PVP") {
    //     change_server("US","PVP");
    // }

    // Move if needed
    this.update_location();
    if (this.move_to_location()) { return }

    // Demand items from everyone. Dont spam it
    if (this.runCount >= 7) {
        let all_to_get = COMPOUNDABLE.concat(TRASH, FARMABLE, UPGRADEABLE);
        game_log("CollectItemsMission requesting TRASH, FARMABLE, UPGRADEABLE");
        request_items_from_all(all_to_get);
    }

    // Run for ~10 seconds
    this.runCount--;

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
        if (items_to_retrieve.length == 0) {
            this.cancel();
            return;
        }
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

    move_to_location() {
        this.location = this.locations[this.location_idx];
        return super.move_to_location();
    }
}


/*****************************************************************************/

class SortBankMission extends Mission {
    /*
    Go to bank, sort it.
    */
    constructor() {
        let name = "SortBank";
        let prio = MISSION_PRIORITY[name];
        super(name, prio);

        // Todo Consider logic for multi-location missions
        this.location = LOCATION_BANK;

        this.verbose = true;
        this.startTimeMs = undefined;

        this._started = false;
    }

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

        if (!this._started) {
            sort_all_bank();
            this._started = true;
        }
        // Wait 1 minute
        let secondsToRun = 90;
        let maxRunTimeMs = secondsToRun*1000;
        let timeSoFar = Date.now() - this.startTimeMs;
        if (timeSoFar > maxRunTimeMs) {
            this.cancel();
        } else {
            Logger.log("SortBank seconds remaining: "+ (secondsToRun - timeSoFar/1000) )
        }
    }
}


/*****************************************************************************/

class HandleUpgradeablesMission extends Mission {
    /* 
    Go to bank, check for Upgradeables, retrieve them
    Go to town, wait for upgrades.
    Deposit remaining items in bank
    */
    constructor() {
        let name = "HandleUpgradeables";
        let prio = MISSION_PRIORITY[name];
        super(name, prio); 

        // Todo Consider logic for multi-location missions
        this.locations = [LOCATION_BANK, LOCATION_TOWN];
        this.location_idx = 0;

        this.verbose = true;
        this.toDeposit = new Set(Object.keys(UPGRADEABLE_LEVELS));
        this.startTimeMs = undefined;

        this.runCount = 10;
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
        
        // Avoid moving if currently upgrading
        if (character.q.compound || character.q.upgrade || character.q.exchange) return;

        // Move if needed
        if (this.move_to_location()) { return; }
        if (this.retrieve()) { return; }
        this.location_idx = 1;
        if (this.move_to_location()) { return; }

        // wait
        if (character.q.upgrade) {
            this.runCount = 10;
        } else {
            this.runCount--;
        }

        if (this.runCount <= 0) {
            this.cancel()
        }
    }

    retrieve() {
        Logger.log("this._retrieve_done: "+this._retrieve_done);
        if (this._retrieve_done == false) {
            Logger.log("this._retrieve_done is set: "+this._retrieve_done);
            return this._retrieve_done;
        }
        if (!is_in_bank()) { game_log("retrieve() called out of bank - BAD"); }
        let items_to_retrieve = bank_get_upgradeables();
        if (items_to_retrieve.length == 0) {
            this.cancel();
            return;
        }
        /*  [{ "packname": "items0",  "idx": 22 },..] */
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
                    organized_bank_store(i);
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

class ClearPVPItemsMission extends Mission {
  constructor() {
    let name = "ClearPVPItems";
    let prio = MISSION_PRIORITY[name];
    super(name, prio); 

    // Go to town first to auto sell
    this.locations = [LOCATION_TOWN, LOCATION_BANK];
    this.location_idx = 0;
    this.location = this.locations[0];

    this.verbose = true;
    this.runCount = 10;
  }

  can_run() { 
    return true;
  }

  run() {
    if (this.verbose) Logger.log(`${this.name} Run()`);

    if (this.runCount <= 0) { this.cancel(); }
    if (this.move_to_location()) { return }  // Town to sell Trash 
    this.location_idx = 1;
    if (this.move_to_location()) { return } // Bank

    // Store almost all items
    let item_stored = false;
    for(let i=0;i<42;i++) {
        let item = character.items[i];
        if(item && "v" in item) {
            organized_bank_store(i);
            item_stored = true;
        }
    }
    if (!item_stored) this.cancel();
    this.runCount--;
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
    this.whitelist = new Set(["tracker","hpot0","mpot0","hpot1","mpot1","elixirluck",
        "stand0","rod","pickaxe"]);

    this.runCount = 3;

    // Attempt the deposit step more than once
    this.depositCount = 3;
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

    if (character.in == "bank") {
        this.location_idx = 1;
    }
    // Move if needed
    if (this.move_to_location()) { return } // Town
    
    // Upgrade/combine for X seconds
    if (this.runCount > 0) {
        if (character.q.compound || character.q.upgrade) {
            this.runCount = 3;
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
            if (!this.whitelist.has(name) 
                && !name.includes("scroll")
                && !name.includes("candy")) {

                // Tiny delay massively improves this method
                Sleep(20);
                organized_bank_store(i);
            }
        }
    }
    this.depositCount--;
    Logger.log(`depositCount: ${this.depositCount}`);

    if (this.depositCount <= 0) {
        this.cancel();
    }
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
                organized_bank_store(i);
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
    if (!character.slots["mainhand"] || character.slots["mainhand"].name != "rod") { 
        unequip("mainhand");
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
    if (!character.slots["mainhand"] || character.slots["mainhand"].name != "pickaxe") { 
        unequip("mainhand");
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