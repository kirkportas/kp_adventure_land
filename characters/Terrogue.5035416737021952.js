// Line 1
game_log("Loading Rogue char file");
load_code("utils_init");
load_code("pattack");

var attack_mode=true;


setInterval(attackloop, 5);

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
