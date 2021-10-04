// Line 1
game_log("Loading Mage char file");
load_code("utils_init");
var attack_mode=true;

setInterval(mainloop, 1000/5); // Loops every 1/5 seconds.
setInterval(cache_loop, 5000); 


function port_merchant() {
	use_skill("magiport", NameMerchant);
}
add_top_button("summonMerch","summonMerch", port_merchant);