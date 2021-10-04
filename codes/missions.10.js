/*
Draft mission overview for merchant.


High-level

"GetInventoryOfBank"

"GetBankItemLocsForAllCompoundables"
- GoToBank
- ReadAllBankItems

*/

var STATE_ACTIVE = "active";
var STATE_DONE = "done";

// WORKS
// class Foo {
// 	constructor() {
// 		this.bar = "bar"; // queue
// 	}

// 	getBar() {
// 		game_log(this.bar);
// 	}
// }
// let foo = new Foo();
// foo.getBar();

class Bar {
	constructor() { this.bar = "far"; }
}
Bar.prototype.setFoo = function() {
	this.foo = "foo";
}
Bar.prototype.getFoo = function() {
	console.log(this.foo); game_log(this.foo);
}
let bar = new Bar();
bar.foo;
bar.setFoo();
bar.getFoo();

// let mc = new MissionControl();
// mc.init()
class MissionControl {
	constructor() {
		this.q = []; // queue
	}

	// For testing
	init() {
		// this.q.push(1); // For example
		this.q.push(new FishingMission());
	}

	run_missions() {
		setInterval(this._run_missions.bind(this), 1000);
	}
}

MissionControl.prototype._run_missions = function() {
	if (this.q.length == 0) { return; } // error Cannot read properties of undefined
	let top_mission = this.q[0];

	if (top_mission.status == STATE_DONE) {
		game_log("Mission state DONE -> "+top_mission.name);
		this.q.shift();
	} else {
		top_mission.run();
	}
}

/*

	sort() {
		this.q.sort(function(m1,m2) {
			if (m1.priority < m2.priority) { return -1 };
			if (m1.priority > m2.priority) { return 1 };
			return 0;
		});
	}
	*/

class Location {
	constructor(x, y, mapname) {
		this.x = x;
		this.y = y;
		this.map = mapname;
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

    this.verbose = true; // Memory.verbose.claim ? true : false;
  }

  // Each mission must define its starting requirements
  can_run() { return false }
}

class FishingMission extends Mission {
  constructor() {
  	let name = "Fishing", prio = 15;
    super(name, prio); // This should be a unique name?

    this.location = new Location(-1360, 1400, "main");
    this.verbose = true;
  }

  // Check if fishing rod in mainhand or inventory.
  can_run() { return !("fishing" in parent.next_skill); }

  run() {
  	if (this.verbose) Logger.log("FishingMission Run()");
  	if (!this.can_run()) {
  		Logger.log("Unable to run mission "+this.name);
  		return;
  	}

  	// Move if needed
  	if (this.move_to_location()) { return }

  	// Execute fishing action
    if(!character.c.fishing) {
        use_skill("fishing");
    }
  }

  move_to_location() {
  	if (character.map != this.location.map) {
  		game_log("1");
  		smart_move(this.location);
  		return true;
  	} else if (distance(character, this.location) > 3) {
  		game_log("2");
  		smart_move(this.location);
  		// move_to(this.location);
  		return true;
  	}
  	game_log("3");
  	return false;
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