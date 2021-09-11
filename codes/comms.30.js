

if (!init_shared) {
	var count = 0;
	var max = 5;
	var init_shared = true;
}
var name = character.name;



function comms() {
	if (name == NameRanger) {
		set(count, {"msg":"setByRanger","Date.now":Date.now()})

		count++;
	} else if (name==NameWarrior) {
		get(count, {"msg":"setByRanger","Date.now":Date.now()})
		count++;

	} else if (name==NamePriest) {

	}
}
setInterval(comms, 1000/4); // Loops every 1/4 seconds.
