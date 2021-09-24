// Line 1
game_log("Loading Warrior char file");
load_code("utils_init");
var attack_mode=true;

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(scan_for_bestiary_updates, 9000);
