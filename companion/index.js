import {File_Comm} from "./file_comm";
import {me as companion} from "companion"; 

const MILLISECONDS_PER_MIN = 1000 * 60;
companion.wakeInterval = 5 * MILLISECONDS_PER_MIN;

if (!companion.permissions.granted("run_background")) {
  console.warn("We're not allowed to access to run in the background!");
}


companion.addEventListener("wakeinterval", ()=>{
    console.log("Wake interval hit");
    comm.start();
});

let comm = new File_Comm();
function init(){

    comm.add_on_message("tran", (res_message)=>{
        console.log(`received tran: ${res_message}`);
        comm.send_message(res_message, "tran");
    });

    comm.start();

}

init();