
if (!init_comms) {
	var count = 0;
	var zmax = 5;
	init_comms = true;
	game_log("Comms initted");
}
var name = character.name;

function comms() {
	if (name == NameRanger) {
		set(count, {"msg":"setByRanger","Date.now":Date.now()})

		count++;
	} 
	// else if (name==NameWarrior) {
	// 	get(count, {"msg":"setByRanger","Date.now":Date.now()})
	// 	count++;

	// } else if (name==NamePriest) {

	// }
}
setInterval(comms, 1000/4); // Loops every 1/4 seconds.
