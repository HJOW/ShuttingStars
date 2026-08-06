const { invoke } = window.__TAURI__.core;

/*
let greetInputEl;
let greetMsgEl;
async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}
*/

window.addEventListener('load', function(){
    /*
    greetInputEl = document.querySelector("#greet-input");
    greetMsgEl = document.querySelector("#greet-msg");
    document.querySelector("#greet-form").addEventListener("submit", (e) => {
        e.preventDefault();
        greet();
    });
    */

    const root = document.getElementsByClassName('shuttingstar_canvas_root')[0];
    ShuttingStars.setBeforeInitializeHook(function(broker) {
        broker.apply({
            fOnShutdownCalled : function() {
                window.close();
            }
        });
    });
    ShuttingStars.init(root, './', function(broker) {
        document.getElementById('shuttingstars_init_loading').style.display = 'none';
    });
});