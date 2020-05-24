import { outbox } from "file-transfer";
import { inbox } from "file-transfer";
import * as fs from 'fs';

/** Take from  https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php */
function get_uid(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export function File_Comm() {
    // Container for on_message functions
    this.on_message_containter = {};

    this.started = false;
    this.start = function(){
        this.started = true;
        this.read_inbox();
    }

    this.send_message = function (mess, id, funct) {
        // add function 
        if(funct)
            this.on_message_containter[id] = funct;

        //Write file
        let file_name = `/private/data/fileComm${get_uid()}.txt`;
        let send_text = JSON.stringify({ id: id, message: mess });
        console.log(`Writing ${send_text} to ${file_name}`);
        fs.writeFileSync(file_name, send_text, "utf-8");
        //Send message
        outbox.enqueueFile(file_name)
            .then((ft) => {
                console.log(file_name);
            })
            .catch((error) => {
                if (this.on_error)
                    this.on_error(error);
            });
    };

    this.add_on_message = function (id, funct) {
        //add function
        this.on_message_containter[id] = funct;
    };

    this.on_error = null;
    this.set_error_funct = function (funct) {
        this.on_error = funct;
    }

    this.read_inbox = ()=>{
        if(this.started)
        {
            let fileName;
            while (fileName = inbox.nextFile()) {
                // let file_name = `/private/data/${fileName}`;
                console.log(`FileName: ${fileName}`);
                let file_text = fs.readFileSync(fileName, "cbor");
                console.log(`file_comm: received: ${file_text}`);
                let mess = JSON.parse(file_text);
        
                if (this.on_message_containter.hasOwnProperty(mess.id)) {
                    let responce_mess = JSON.parse(mess.message);
                    this.on_message_containter[mess.id](responce_mess);
                    fs.unlinkSync(fileName); 
                }
            }
        }
    }


    // Set up listener
    inbox.addEventListener("newfile", this.read_inbox);
};