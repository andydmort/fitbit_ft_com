import { outbox } from "file-transfer";
import { inbox } from "file-transfer";
import { encode } from 'cbor';


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
        //Send message
        let file_name = `fileComm${get_uid()}.txt`;
        let send_data = encode(JSON.stringify({ id: id, message: mess }));
        outbox.enqueue(file_name, send_data)
            .then((ft) => {
                console.log(`File_comm sent ${file_name}`);
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

    // this.default_response = function(message){
    //     console.log("Initial response not set") ;
    // }

    // this.set_default_response = function(funct){
    //     this.default_response = funct;
    // }

    this.read_inbox = async function(){
        if(this.started)
        {
            let file;
            while ((file = await inbox.pop())) {
                const payload = await file.text();
                console.log(`received file contents: ${payload}`);
                let mess = JSON.parse(payload);
                if(this.on_message_containter.hasOwnProperty(mess.id))
                {
                    this.on_message_containter[mess.id](mess.message);
                }
            }
        }
    }

    // Set up listener
    inbox.addEventListener("newfile", async () => {
        await this.read_inbox();
    });
}