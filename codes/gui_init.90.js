

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


game_log("Finished load_code( gui_init )");