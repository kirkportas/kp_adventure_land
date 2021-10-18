

if (character.ctype == "merchant") {

    add_top_button("showPonty","showPonty", function() {
        show_json(get(PONTY_KEY));
    });
    add_top_button("eventTypes","eventTypes", () => {
        show_json(get("stats_game_events_dict").actions_custom)
    });
    add_top_button("showMissions","showMissions", function() {
        show_json(missionControl.q);
    });
    // add_top_button("sortBank","sortBank", sort_all_bank);
    add_top_button("renderBankItems","renderBankItems", show_bank_items);


    /* Add all top buttons for mission control
     * The 3rd param is a single parameter to be passed to a mission.
     * These buttons insert a mission.
     *
     * Example of direct addition
       add_top_button("M-Compound","M-Compound", function() {
           let m = new HandleCompoundablesMission();
           missionControl.addMission(m);
       });
     *
     * Format: ["Name for UI and DOM", MissionClass, Parameter]
     */

    let mission_buttons = [
        // ["M-name", SomethingMission, null, add_top_button],
        ["M-Compound", HandleCompoundablesMission, null, add_bottom_button],
        ["M-Upgrade", HandleUpgradeablesMission, null, add_bottom_button],
        ["M-C-Terranger", CollectItemsMission, "Terranger", add_bottom_button],
        ["M-Deposit", DepositEverythingMission, null, add_bottom_button],
        ["M-SortBank", SortBankMission, null, add_bottom_button],
        ["M-TrashCompound", TrashCompoundMission, null, add_bottom_button],
    ];

    for (let btn of mission_buttons) {
        let name = btn[0],
            missionClass = btn[1],
            param = btn[2],
            gui_method = btn[3];

        let handlerFunc = function() {
            if (param != null) {
                missionControl.addMission(new missionClass(param));
            } else {
                missionControl.addMission(new missionClass());
            }
        };

        gui_method(name, name, handlerFunc);
    }

}


function Sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
al_items = {}

const order = {}
al_items.order = order;

order.names = [
  "Helmets",
  "Armors",
  "Underarmors",
  "Gloves",
  "Shoes",
  "Capes",
  "Rings",
  "Earrings",
  "Amulets",
  "Belts",
  "Orbs",
  "Weapons",
  "Shields",
  "Offhands",
  "Elixirs",
  "Potions",
  "Scrolls",
  "Crafting and Collecting",
  "Exchangeables",
  "Others"
];
order.ids = [
  "helmet",
  "chest",
  "pants",
  "gloves",
  "shoes",
  "cape",
  "ring",
  "earring",
  "amulet",
  "belt",
  "orb",
  "weapon",
  "shield",
  "offhand",
  "elixir",
  "pot",
  "scroll",
  "material",
  "exchange",
  ""
];
order.item_ids = order.ids.map(_id=>[]);
object_sort(G.items, "gold_value").forEach(function(b) {
  if (!b[1].ignore)
    for (var c = 0; c < order.ids.length; c++)
      if (!order.ids[c] || b[1].type == order.ids[c] || "offhand" == order.ids[c] && in_arr(b[1].type, ["source", "quiver", "misc_offhand"]) || "scroll" == order.ids[c] && in_arr(b[1].type, ["cscroll", "uscroll", "pscroll", "offering"]) || "exchange" == order.ids[c] && G.items[b[0]].e) {
        order.item_ids[c].push(b[0]);
        break
      }
});
order.flat_iids = order.item_ids.flat();
order.comparator = function(a,b) {
  return ((a==null)-(b==null)) || (a!=null)&&
  (order.flat_iids.indexOf(a.name)-order.flat_iids.indexOf(b.name)||
  (a.name < b.name && -1 || +(a.name > b.name)) || (b.level-a.level));
}

function sort_all_bank(inv_indices, sorted_bank, i_running)
{
  if(!character.bank) return log("Not inside the bank");
  if(!inv_indices)
  {
    inv_indices = []
    for(let i = 0; i < 42; i++)
    {
      if(!character.items[i])
        inv_indices.push(i);
    }
  }
  if(inv_indices.length == 0) return log("Make some space in inventory");
  if(!sorted_bank)
  {
    let bank_array = [];
    for(let bank_pack in character.bank)
    {
      if(bank_pack == "gold") continue;
      if(bank_pack == "items7") continue; // top right
      bank_array = bank_array.concat(character.bank[bank_pack]);
    }
    bank_array.sort(al_items.order.comparator);
    sorted_bank={};
    for(let bank_pack in character.bank)
    {
      if(bank_pack == "gold") continue;
      if(bank_pack == "items7") continue; // top right
      sorted_bank[bank_pack] = bank_array.slice(0,42);
      bank_array = bank_array.slice(42);
    }
  }
  if(i_running == null)
    i_running = 0;
  else
    i_running = (i_running + 1) % inv_indices.length;
  const inv_pointer = inv_indices[i_running];
  const inv_itm = character.items[inv_pointer];

  //check every
  if(!inv_itm)
  {
    for(let bank_pack in character.bank)
    {
      if(bank_pack == "gold") continue;
      if(bank_pack == "items7") continue; // top right
      for(let i = 0; i < 42; i++)
      {
        if(character.bank[bank_pack][i] && al_items.order.comparator(character.bank[bank_pack][i],sorted_bank[bank_pack][i]))
        {
          log("Swapping empty "+inv_pointer+" with "+i+bank_pack);
          parent.socket.emit("bank",{operation:"swap",pack:bank_pack,str:i,inv:inv_pointer});
          return Sleep(150).then(x=>sort_all_bank(inv_indices,sorted_bank,i_running));
        }
      }

    }
    inv_indices.splice(i_running,1);
    return Sleep(150).then(x=>sort_all_bank(inv_indices,sorted_bank,i_running));

    //good to go. slice off this party of shit and go on
  }
  else
  {
    for(let bank_pack in character.bank)
    {
      if(bank_pack == "gold") continue;
      if(bank_pack == "items7") continue; // top right
      for(let i = 0; i < 42; i++)
      {
        if(!al_items.order.comparator(inv_itm,sorted_bank[bank_pack][i]) && al_items.order.comparator(character.bank[bank_pack][i],sorted_bank[bank_pack][i]))
        {
          log({operation:"swap",pack:bank_pack,str:i,inv:inv_pointer});
          parent.socket.emit("bank",{operation:"swap",inv:inv_pointer,pack:bank_pack,str:i});
          return Sleep(150).then(x=>sort_all_bank(inv_indices,sorted_bank,i_running));
        }
      }
    }
  }

  //if is empty pull misplaced item
  //else if is full place misplaced item
  return sorted_bank;
}
// sort_all_bank()


function show_bank_items() {
    function render_items(a) {
      if(a.length > 0 && !Array.isArray(a[0]))
        {a=[["Items",a]]}
      let b = "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 434px'>";
      a.forEach(function(a) {
        b += "<div class='gamebutton gamebutton-small' style='margin-bottom: 5px'>" +
          a[0] + "</div>";
        b += "<div style='margin-bottom: 10px'>";
        a[1].forEach(function(a) {
          b += parent.item_container({
            skin: G.items[a.name].skin,
            onclick: "render_item_info('" + a.name + "')"
          }, a)
        });
        b += "</div>"
      });
      b += "</div>";
      parent.show_modal(b, {
        wrap: !1,
        hideinbackground: !0,
        url: "/docs/guide/all/items"
      })
    }
    function render_bank_items()
    {
      if(!character.bank) return game_log("Not inside the bank");
      function itm_cmp(a,b)
      {
        return ((a==null)-(b==null)) || a&&(a.name < b.name ? -1 : +(a.name > b.name)) || a&&(b.level -a.level);
      }
      var a = [
        ["Helmets", []],
        ["Armors", []],
        ["Underarmors", []],
        ["Gloves", []],
        ["Shoes", []],
        ["Capes", []],
        ["Rings", []],
        ["Earrings", []],
        ["Amulets", []],
        ["Belts", []],
        ["Orbs", []],
        ["Weapons", []],
        ["Shields", []],
        ["Offhands", []],
        ["Elixirs", []],
        ["Potions", []],
        ["Scrolls", []],
        ["Crafting and Collecting", []],
        ["Exchangeables", []],
        ["Others", []]
      ],
      b = "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 434px'>";
      let slot_ids = [
      "helmet",
      "chest",
      "pants",
      "gloves",
      "shoes",
      "cape",
      "ring",
      "earring",
      "amulet",
      "belt",
      "orb",
      "weapon",
      "shield",
      "offhand",
      "elixir",
      "pot",
      "scroll",
      "material",
      "exchange",
      ""]
      object_sort(G.items, "gold_value").forEach(function(b) {
        if (!b[1].ignore)
          for (var c = 0; c < a.length; c++)
            if (!slot_ids[c] || b[1].type == slot_ids[c] || "offhand" == slot_ids[c] && in_arr(b[1].type, ["source", "quiver", "misc_offhand"]) || "scroll" == slot_ids[c] && in_arr(b[1].type, ["cscroll", "uscroll", "pscroll", "offering"]) || "exchange" == slot_ids[c] && G.items[b[0]].e) {
              //a[c][1].push({name:b[1].id});
              const dest_type = b[1].id;
              let type_in_bank=[];
              for(let bank_pock in character.bank)
              {
                const bank_pack = character.bank[bank_pock];
                for(let bonk_item in bank_pack)
                {
                  const bank_item=bank_pack[bonk_item];
                  if(bank_item && bank_item.name == dest_type)
                    type_in_bank.push(bank_item);
                }
              }
              type_in_bank.sort(itm_cmp);
              //sucessive merge, flatten
              for(let io = type_in_bank.length - 1; io >= 1; io--)
              {
                if(itm_cmp(type_in_bank[io],type_in_bank[io-1]) == 0)
                {
                  type_in_bank[io-1].q = (type_in_bank[io-1].q || 1) + (type_in_bank[io].q || 1);
                  type_in_bank.splice(io,1);
                }
              }
              a[c][1].push(type_in_bank);
              break;
            }
      });
      for (var c = 0; c < a.length; c++)
      {
        a[c][1] = a[c][1].flat();
      }
      //show_json(a);
      render_items(a);
    }
    render_bank_items();
}
// show_bank_items()


game_log("Finished load_code( gui_init )");