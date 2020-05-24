import document from "document";
import * as fs from "fs";
import * as common from "./common";

let num_list_items = 10;
// let data_file_name = "babyfeed_list_data.txt";

let list_items = [];
let list_texts = [];
let data = undefined;
let scr = document.getElementById(`q_src`);

export function init(data) {
    
    // Gather all the list items
    for (let i = 0; i < num_list_items; i++) {
       let list_item =  document.getElementById(`tile_item_${i}`);
       list_items.push(list_item);
       let list_text = document.getElementById(`text_item_${i}`);
       list_texts.push(list_text);
    }

    update_ui(data);

    scr.style.visibility = "visible";
}

function update_ui(data){
    console.log(`Update UI: ${data.length} elements`);

    for(let i = 0; i < data.length; i++)
    {
        let list_item = list_items[i];
        let list_text = list_texts[i]; 
        let curr_data = data[i];
        
        list_text.text = `${curr_data.status} ==> ${curr_data.mess}`;
        list_item.style.visibility = "visible";
    }
}

export function add_data(data_) {

    console.log(`Adding Data: ${JSON.stringify(data_,null,2)}`);

    if(!data) data = [];
    
    data.unshift(data_);

    if(data.length > num_list_items) data = data.slice(0,num_list_items);

    fs.writeFileSync(data_file_name, JSON.stringify(data), "utf-8");

    update_ui(data);
}