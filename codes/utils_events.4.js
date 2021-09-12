
/**  EVENTS 
 * // https://adventure.land/docs/code/game/events
 * 
 * "event"		// Name, map, x, y
 * action
 * hit			// actor + target + source + damage + heal
 * level_up
 * shutdown     // Server shutdown in XX seconds 
 * death		// Character Name or Monster ID 
 * sell		// Item sold to an NPC
 * buy      	// Item bought from an NPC
 * sbuy		// Item bought from Ponty
 * fbuy		// Item bought from Lost and Found
 * item_sent // Player to player item transfer
 * gold_sent // Player to player gold transfer
 * cx_sent   // Player to player cosmetics transfer
 * api_response
**/

/** CODE MESSAGES 
 *  https://adventure.land/docs/guide/X.sub-cm
 * 
 * 
	send_cm("Wizard","hello"); // Send a string
	send_cm("Wizard",{"items":character.items}) // Send your inventory data as a CM
	send_cm(["Wizard","Protector"],{"task":"move","map":character.map,"x":character.x,"y":character.y})
	// you can send CM's to multiple recipients
	// Instead of sending code messages individually, send them to multiple recipients whenever possible, the code cost is lower



	function on_cm(name,data)
	{
		if(name!="Wizard") // Make sure to check who the CM came from
		{
			game_log("Unauthorized CM "+name);
			return;
		}
		show_json(data);
	}
*/


// called by the inviter's name - request = someone requesting to join your existing party
function on_party_request(name) 
{
	if (SLAVES.includes(name) || VALS_TOONS.includes(name) || NameMerchant == name) { 
		accept_party_request(name);
	}
}
