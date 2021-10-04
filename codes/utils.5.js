/* exported start_chars */


function onlineChars() {
    return get_characters().filter(
       x => x.online != 0 // && x.name != character.name
    );
}

// function debounce(func, wait, immediate) {
//   var timeout;
//   return function() {
//     var context = this, args = arguments;
//     var later = function() {
//       timeout = null;
//       if (!immediate) func.apply(context, args);
//     };
//     var callNow = immediate && !timeout;
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//     if (callNow) func.apply(context, args);
//   };
// }

function is_same_server() {
    // The get_characters() object has these values
    // "EUI",
}

function start_chars() {
    if (!last_start_char_ts) {
        var last_start_char_ts = Date.now()-15001;
    }
    if (character.name == LEADER) {
        game_log(Date.now() - last_start_char_ts);
        if (Date.now() - last_start_char_ts > 15000) {  
            var party = get_party();
            for (let char of ACTIVE_PARTY) {
                if (!(char in party)) {
                    start_character(char, char);
                    game_log("Starting character: " + char);
                    Logger.log("Starting character: " + char);
                }
            }
            last_start_char_ts = Date.now();
        }
    }
}

// http://adventure.land/docs/code/functions/send_party_invite

var partyup_last_ts = Date.now();
function party_up() {
    // Only run once per 2 seconds
    var should_run = (Date.now() - partyup_last_ts) > 2000;
    if (!should_run) { return; }
    partyup_last_ts = Date.now();

    // Logger.log("Checking party_up");
    var is_in_party = get_party().length != undefined || character.name in get_party();

    if (character.name == LEADER) {
        if (!is_in_party) {
            game_log("Leader is not in party. party_up SEND_REQUEST");
            for (charObj of onlineChars()) {
                if (charObj.name == character.name) continue;
                if (charObj.server == parent.server_region+parent.server_identifier) {
                    send_party_invite(charObj.name, 1); // party request
                }
            }
        }
        
    } else {
        if (!is_in_party) {
            game_log("party_up SEND_REQUEST");
            // todo bug here
            let leaderArr = onlineChars().filter(x => x.name == LEADER);
            if (leaderArr.length > 0) {
                send_party_request(LEADER); // party request
            } else {
                for (charObj of onlineChars()) {    
                    if (charObj.name == character.name) continue;
                    if (charObj.server == parent.server_region+parent.server_identifier) {
                        send_party_request(charObj.name); // party request
                        game_log("party_up request to "+charObj.name);
                    }
                }
            }
        }
    }

    // Have Vals toons join Kirk's Party, if nearby
    if (VALS_TOONS.includes(character.name)) {
        for (let charName of KIRKS_TOONS) {

            // Ignore merchant. Ignore if already in party.
            if (charname == NameMerchant) continue; 
            if (charname in get_party()) continue;

            if (charName in parent.entities) {
                send_party_request(charName);
            }
        } 
    }
}

// https://discord.com/channels/238332476743745536/243707345887166465/750783323965751417
// For finding targets or HP of another character
// function get_parent(name, is_master) {
function get_parent(name) {
    if (character.name == LEADER) {
        return parent.parent;
    } else {
        const char_iframe = parent.parent.$("#ichar"+name.toLowerCase())[0];
        if (char_iframe) {
            game_log("found char_iframe");
            return char_iframe.contentWindow;
        } else {
            game_log("did not find char_iframe");
        }
    }
}

// Used for checking other char's inventories.
// Should receive a `character.items` object
function get_item_count_in_inventory_array(item_array, name) {
    let count = 0;
    for(var i=0;i<42;i++) {
        let item = item_array[i];
        if(item && item.name==name) {
            if (item.q) {
                count += item.q;
            } else {
                count += 1;
            }
        }
    }
    return count;
}

// todo collapse with above function
function get_item_count_in_inventory(name) {
    let count = 0;
    for(var i=0;i<42;i++) {
        let item = character.items[i];
        if(item && item.name==name) {
            if (item.q) {
                count += item.q;
            } else {
                count += 1;
            }
        }
    }
    return count;
}

function locate_items(name) {
    idxs = [];
    for(var i=0;i<42;i++) {
        if(character.items[i] 
            && character.items[i].name==name) {
            idxs.push(i);
        }
    }
    return idxs;
}
function locate_items_of_level(name, level) {
    idxs = [];
    for(var i=0;i<42;i++) {
        if(character.items[i] 
            && character.items[i].name==name
            && character.items[i].level==level) {
            idxs.push(i);
        }
    }
    return idxs;
}

function locate_items_below_level(name, level) {
    idxs = [];
    for(var i=0;i<42;i++) {
        if(character.items[i] 
            && character.items[i].name==name
            && character.items[i].level<level) {
            idxs.push(i);
        }
    }
    return idxs;
}

function locate_item_below_level(name, level) {
    // Return first found slot of an item at given level
    var slots = locate_items_below_level(name,level);
    if (slots.length) {
        return slots[0];
    } else {
        return -1;
    }
}

function locate_items_at_or_above_level(name, level) {
    idxs = [];
    for(var i=0;i<42;i++) {
        if(character.items[i] 
            && character.items[i].name==name
            && character.items[i].level>=level) {
            idxs.push(i);
        }
    }
    return idxs;
}

function get_compoundables_in_inventory() {
    let raw_inv = {}
    for (var i=0;i<42;i++) {
        let item = character.items[i];
        if(item && ALL_COMPOUNDABLE_ITEMS.has(item.name)) {
            if (this.verbose) Logger.log(`Adding inv item ${item.name} lvl ${item.level}`);
            if (!(item.name in raw_inv)) { raw_inv[item.name] = {}; };
            if (!(item.level in raw_inv[item.name])) { raw_inv[item.name][item.level] = 0; };
            raw_inv[item.name][item.level]++;
        }
    }
    return raw_inv;
}

// Note the hpbelt hack
function inv_has_compoundable_trio() {
    let raw_inv = get_compoundables_in_inventory()
    for (let [itemname, leveldict] of Object.entries(raw_inv)) {
        for (let level of Object.keys(leveldict)) {
            if (leveldict[level].length >= 3) {
                return true;
            }
        }
    }
    return false;
}


function bank_get_compoundables_count() {
    if (!is_in_bank()) { return [] }
    this.verbose = true;

    if (this.verbose) Logger.log(`bank_get_compoundables_count()`);
    // Detailed count with bankpack locations for Bank items
    let raw = {};
    for (let [packname,pack] of Object.entries(character.bank)) {
        if (this.verbose) Logger.log(`Checking pack: ${packname}`);
        for (var i=0;i<42;i++) {
            let item = pack[i];
            if(item && ALL_COMPOUNDABLE_ITEMS.has(item.name)) {
                if (this.verbose) Logger.log(`Adding bank item ${item.name} lvl ${item.level}`);
                if (!(item.name in raw)) { raw[item.name] = {} };
                if (!(item.level in raw[item.name])) { raw[item.name][item.level] = [] };

                // set in utils init
                if (item.level >= max_level_compound) continue;
                if (item.name=="hpbelt" && item.level == 2) continue; // hack

                raw[item.name][item.level].push({'packname':packname, 'idx': i});
            }
        }
    }

    // Numeric count for inventory items by level
    let raw_inv = get_compoundables_in_inventory(); // {}

    let items_to_retrieve = [];
    for (let [itemname, leveldict] of Object.entries(raw)) {
        for (let level of Object.keys(leveldict)) {
            let invcount = 0;
            if (raw_inv[itemname] && raw_inv[itemname][level]) {
                invcount += raw_inv[itemname][level];
                if (this.verbose) Logger.log(`Counting item in inv ${itemname} ${level}`);
            }

            if (leveldict[level].length >= 3 - invcount) {
                if (this.verbose) Logger.log(`Adding item tor retrieve list lvl ${itemname} ${level}`);
                items_to_retrieve = items_to_retrieve.concat(leveldict[level]);
            }
        }
    }
    // show_json(raw);
    // show_json(items_to_retrieve);
    return items_to_retrieve;
}

function locate_bank_items(name) {
    //todo expand for more bank packs
    var bankpacks = ["items0","items1"];
    var itemlocs = {'items0':[], 'items1':[]};

    for (pack of bankpacks) {
        for(var i=0;i<42;i++) {
            if(character.bank[pack][i] 
                && character.bank[pack][i].name==name) {
                itemlocs[pack].push(i);
            }
        }
    }
    return itemlocs;
}
/*
var itemlocs = locate_bank_items("stinger");
for (pack of Object.keys(itemlocs)) {
    for (idx of itemlocs[pack]) {
        bank_retrieve(pack, idx);
    }
}
*/
function sell_all_trash(){
    character.items.forEach((item, index) => {
        if (item
            && TRASH.includes(item.name)
            && item_grade(item) < 2
            && item.level < 2) {
            log(`Merchant is unloading trash ${item.name}`);
            item.q ? sell(index, item.q) : sell(index, item);
        }
    });
}

//  {
//  "items0": [
//      1,2
//  ],
//  "items1": [
//      21,23
//  ]
// }

// function locate_item(name) {
//  for(var i=0;i<42;i++) {
//      if(character.items[i] && character.items[i].name==name) return i;
//  }
//  return -1;
// }

// .q is broken
// function get_item_quantity(item) {
//  idx = locate_item(item);
//  return character.items[idx].q
// }

function give_all_of_single_item(item) {
    // number_of_items = get_item_quantity(item);
    let item_idxs = locate_items(item);
    for (idx of item_idxs) {
        let item = character.items[idx];
        let quantity = item.q ? item.q : 1;
        send_item(NameMerchant, idx, quantity);
        return true;
    } 
    
    // var item_idx = locate_item(item);
    // if(item_idx >= 0) {
    //  var item = character.items[item_idx];
    //  var quantity = item.q ? item.q : 1;
    //  send_item(NameMerchant, item_idx, quantity);
    //  return true;
    // } else {
    //  return false;
    // }
}

    // Grade 0 => scroll0
    // Grade 1 => scrol 1
    // "grades": [7, 9, 10, 12 ],
function get_item_grade(item) {
    var gitemgrades = G.items[item.name].grades;

    Logger.log("get_item_grade(). grades="+gitemgrades.toString());
    // in not of 
    for (i in gitemgrades) {
        if (item.level < gitemgrades[i]) {
            return i;
        }
    }
}
// game_log(get_item_grade(locate_item(2)))
// game_log(locate_item(2))


// const SCROLLS_BY_ITEM_GRADE = ["scroll0", "scroll1", "scroll2"];
// const grade = item_grade(item);
// const scroll_name = SCROLLS_BY_ITEM_GRADE[grade];
// const slot_scroll = locate_item(scroll_name);


// https://github.com/farettig/adventure-land/blob/b810b96f58eef462b2dd493073499acee0a79d48/merchantSkills.js
// Adapted From Lotus
/*
Example of data[0], e.g. a pontyItem
{
    "name": "wshoes",
    "level": 0,
    "rid": "iqxfs"
}

// Snippet to add a new item:
    let ITEM_TO_ADD = "gslime";
    let ITEM_TO_ADD = "vitearring";
    let ITEM_TO_ADD = "gslime";
    let ITEM_TO_ADD = "intring";
    

    let ITEM_TO_ADD = "bfur";
    let QUANTITY = 20;
    let PONTY_KEY = "ponty_items_to_buy";
    let ponty_desired = get(PONTY_KEY);
    ponty_desired[ITEM_TO_ADD] = QUANTITY;
    set(PONTY_KEY, ponty_desired);
    show_json(get(PONTY_KEY));

    let PONTY_KEY = "ponty_items_to_buy";
    let ponty_desired = get(PONTY_KEY);
    delete ponty_desired[ITEM_TO_ADD];
    set(PONTY_KEY, ponty_desired);
    show_json(get(PONTY_KEY));

    let PONTY_KEY = "ponty_items_to_buy";
    show_json(get(PONTY_KEY));
*/

function showPontyBuyList() {
    show_json(get(PONTY_KEY));
}

function showGiveItems() {
    show_json(get("give_items_"+character.name));
}
/* Debugcode 
    if (debug && pontyItem.name.includes("earring")) {
                game_log(pontyItem.name);
                game_log(itemsToBuy[pontyItem.name]);
                game_log(pontyItem.name in itemsToBuy);
                game_log(itemsToBuy[pontyItem.name] > 0);
            }
                    if (debug) game_log(2);
                    if (debug) game_log((pontyItem.q ?? 1));
                    if (debug) game_log(itemsToBuy[pontyItem.name] - (pontyItem.q ?? 1));

*/
function pontyPurchase()
{
    game_log("pontyPurchase()");

    // Load from localStorage
    if (!get(PONTY_KEY) || get(PONTY_KEY) == {}) {
        // Name and quantity
        let desired = {
            "strearring": 6,
            "intearring": 6,
            "dexearring": 6,
            "cape": 4,
        }
        set(PONTY_KEY, desired);
    }
    let itemsToBuy = get(PONTY_KEY);

    let debug = false; // Set to false to debug
    parent.socket.emit("secondhands");
    parent.socket.once("secondhands", function (data)
    {    
        game_log("secondhands returned");
        let should_save = false;
        for (let pontyItem of data) {
            if (debug) {
                game_log(pontyItem);
                // show_json(pontyItem);
                debug = true;
            }

            let buy = false;
            
            // Ponty cost multiplied is 2
            // Skip if too expensive or can't afford
            let cost = parent.calculate_item_value(pontyItem) * 2 * (pontyItem.q ?? 1);
            let auto_buy_cost_limit = 1 * 1000 * 1000; // 1mill
            if (cost > character.gold || cost > auto_buy_cost_limit) continue;
            // game_log(`Cost of - ${pontyItem.name}, q: ${pontyItem.q}: ${cost}`);

            // if (itemsToBuy.includes(pontyItem.name)) {
            if (pontyItem.name in itemsToBuy) {
                if (itemsToBuy[pontyItem.name] > 0) {
                    // itemsToBuy[pontyItem.name] = itemsToBuy[pontyItem.name] - (pontyItem.q ?? 1);
                    itemsToBuy[pontyItem.name] = itemsToBuy[pontyItem.name] -1;
                    buy = true;
                }
            } 

            if (buy) {
                game_log("Buying " + G.items[pontyItem.name].name + " from Ponty!");
                parent.socket.emit("sbuy", { "rid": pontyItem.rid });
                should_save = true;
            }
        }
        // Save after any purchases.
        if (should_save) {
            set(ponty_key, itemsToBuy);
        } else {
            game_log("No desired items at Ponty");
        }
    });

    // parent.socket.emit("secondhands");
}

function joinGiveAways(){
  let joined = false;
  for(let id in parent.entities)
    {
        let entity = parent.entities[id];
        if(entity.id != character.id)
        {
            for(let slot_name in entity.slots)
            {
                let slot = entity.slots[slot_name];
                if(slot && slot.giveaway)
                {
                    if(!slot.list.includes(character.id))
                    {
                        parent.join_giveaway(slot_name,entity.id,slot.rid);
                        joined = true;
                    }
                }
            }
        }
    }
    if (joined) {
        game_log("Joined a giveaway!");
    } else {
        game_log("No giveaways active.");
    }
}


game_log("Finished load_code( utils )");
