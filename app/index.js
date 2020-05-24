import document from "document";
import {File_Comm} from "./file_comm";
import * as fs from "fs";
import * as q_src from "./q_src";

let comm = new File_Comm();



let q_file = "q_file.txt";

let q = [];
let send_message_button = document.getElementById("send_btn");
send_message_button.onclick = send_message;
let go_to_queue_button = document.getElementById("q_btn");
let options_src = document.getElementById("options_screen");
go_to_queue_button.onclick = function(){
    options_src.style.visibility = "hidden";
    q_src.init(q);
}
let sent_message_txt = document.getElementById("message_status");
let clear_q_btn = document.getElementById("clear_q_btn");

clear_q_btn.onclick = function() {
    console.log("clear q!");
    q = [];
    save_q();
}



/** Take from  https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php */
function get_uid(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function init(){
    console.log("initializing App");

    // fs.unlinkSync(q_file);

    sent_message_txt.text = "";

    if(fs.existsSync(q_file))
    {
        let file_text = fs.readFileSync(q_file, "utf-8");
        q = JSON.parse(file_text);
    }

    comm.add_on_message("tran", resp_func);
    comm.start();
}

function save_q(){
    fs.writeFileSync(q_file, JSON.stringify(q), "utf-8");
}


function resp_func(resp){
    console.log(`Received Response: ${resp}`);
    let found = undefined;

    
    q.forEach((candidate)=>{
        console.log(`in loop ====> comparing ${candidate.id} to ${resp.id}`);
        if(candidate.id == resp.id)
        {
            console.log("found candidate");
            found = candidate;
        }
    });
    
    if(found)
    {
        console.log(`found coresponding queue message: ${found}`);
        found.status= "received";
    }

    console.log(`Current q: ${JSON.stringify(q)}`);

    save_q();
}



function send_message(){

    let message_id = get_uid();

    let message_text = JSON.stringify({id: message_id , time: new Date()});

    q.push({id: message_id, mess: (new Date()).toString() , status: "sent"});
    save_q();

    console.log(`Current q: ${JSON.stringify(q)}`);

    console.log(`Sending message: ${message_text}`);

    comm.send_message(message_text, "tran");

}


init();





