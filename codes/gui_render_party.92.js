function new_render_party() {
    var b = "";
    for (var charname in parent.party) {
        var c = parent.party[charname];
        // var charObj = get_entity(charname);
        // var charObj = get_parent(charname);
        // if (charname=="Terranger") {
        //     set("1", charObj);
        // }

        // / Gave typeerror convertingcircular..
        
        b += " <div class='gamebutton'"; 
        b += "      style='padding: 6px 8px 6px 8px; font-size: 24px; line-height: 18px'"
        b += " onclick='party_click(\"" + charname + "\")'>";
        b += parent.sprite(c.skin, {
            cx: c.cx || [],
            rip: c.rip
        });
        if (c.rip) {
            b += "<div style='color:gray; margin-top: 1px'>RIP</div>";
        } else {
            b += "<div style='margin-top: 1px'>" + charname.substr(0, 3).toUpperCase() + "</div>";
        }
		b += "<div style='margin-top: 1px'>" + (c.share*100).toFixed(0) + "%</div>";
        // Show HP percent
        // game_log("charObj.hp: "+ charObj.hp);
        // b += "<div style='margin-top: 1px'>" + (charObj.hp/charObj.max_hp) + "%</div>";
        b += "</div>";
    }
    parent.$("#newparty").html(b);
    if (!parent.party_list.length) {
        parent.$("#newparty").hide()
    } else {
        parent.$("#newparty").show()
    }
}
parent.render_party = new_render_party;

setInterval(function(){
	new_render_party();
}, 1000);

game_log("Finished load_code( render_party )");