// Line 1
game_log("====== START ============");
game_log("====== START ============");
game_log("====== START ============");
game_log("Loading Priest char file");
load_code("utils_init");
var attack_mode=true;

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(cache_loop, 5000); 


//Todo add heal loop.
// heal_party();



//Returns the party member with the lowest hp -> max_hp ratio.
function lowest_health_partymember() {
    var party = [];
    if (parent.party_list.length > 0) {
		for(id in parent.party_list) {
			var member = parent.party_list[id];	
			var entity = parent.entities[member];
			
			if(member == character.name) {
				entity = character;
			}
			
			if(entity != null) {
				party.push({name: member, entity: entity});
			}
		}
    } else {
		//Add Self to Party Array
		party.push({
			name: character.name,
			entity: character
		});
	}

    //Populate health percentages
    for (id in party) {
        var member = party[id];
        if (member.entity != null) {
            member.entity.health_ratio = member.entity.hp / member.entity.max_hp;
        } else {
            member.health_ratio = 1;
        }
    }
	
    //Order our party array by health percentage
    party.sort(function (current, next) {
        return current.entity.health_ratio - next.entity.health_ratio;
    });

    //Return the lowest health
    return party[0].entity;
}