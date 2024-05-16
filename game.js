
let size = 15; // Should be odd
let bomb_percent = 6; //(1/nr)
let mode = "Dark";
let color = "Green";
const modes = {
    "Dark":{
        "Green":{"bg":"#e0c995", "font":"#000000", "board":"#2b9e4d", "bomb":"255, 0, 0"}
    },
    "Flag":{
        "Purple":{"bg":"#4424b8", "font":"#ffffff", "board":"#272031", "bomb":"255, 0, 85"},
        "Pink":{"bg":"#79b8ff", "font":"#72203f", "board":"#ffaccc", "bomb":"255, 255, 255"}
    }
}
displayColorsOnHTML();
displaySettingsOnHTML();

let map = undefined;

let flags = [];
let open_fields = [];

let timer = 0;
let stop_timer = false;

let bomb_amount = 0;

let board_div = document.getElementById("game_board");
board_div.style.gridTemplateColumns = "repeat("+size+", 1fr)";
for (let i=0; i < size*size; i++) {
    board_div.innerHTML += `
    <div id="${i}" onclick="leftClicked(${i})" oncontextmenu="rightClicked(${i});return false;">
        <div id="flag_${i}"><div class="svg_flag"></div></div>
        <span id="map_nr_${i}"></span>
    </div>
    `;
}


function leftClicked(nr) {
    if (map == undefined) {
        map = newMap(nr);
        addNrToBoard();
        startTimer();
    }
    openField(nr);
    openMoreIfZero(nr);
}

function rightClicked(nr) {
    toggleFlag(nr);
}



function newMap(start) {
    let new_map = []; // Will be new_map[x][y] to get point

    // Create bombs
    for (let x=0; x < size; x++) {
        new_map.push([]);
        for (let y=0; y < size; y++) {

            if (Math.floor((Math.random() * bomb_percent)) == 0) {
                new_map[x].push("¤");
            } else {
                new_map[x].push(0);
            }
        
        }
    }

    // Create open start
    let min_start = 3;
    for (let x=-Math.floor(min_start/2); x < min_start-Math.floor(min_start/2); x++) {
        for (let y=-Math.floor(min_start/2); y < min_start-Math.floor(min_start/2); y++) {
            try {
                new_map[nrToCords(start)[0]+x][nrToCords(start)[1]+y] = 0;
            } catch (err) {
                // console.warn(err);
            }
        }
    }

    // Create numbers
    for (let x=0; x < size; x++) {
        for (let y=0; y < size; y++) {

            if (new_map[x][y] == "¤") {
                bomb_amount++;

                for (let x1=-1; x1 <= 1; x1++) {
                    for (let y1=-1; y1 <= 1; y1++) {
                        try {
                            if (new_map[x+x1][y+y1] != "¤" && Number.isInteger(new_map[x+x1][y+y1])) {
                                new_map[x+x1][y+y1] ++;
                            }
                        } catch (err) {
                            // console.warn(err);
                        }
                    }
                }
            }
        
        }
    }

    document.getElementById("bomb_count").innerText = bomb_amount<10 ? "0"+String(bomb_amount) : bomb_amount;
    return new_map;
}

function addNrToBoard() {
    for (let i=0; i < size*size; i++) {
        if (map[nrToCords(i)[0]][nrToCords(i)[1]] == 0) {
            continue;
        }

        document.getElementById("map_nr_"+i).innerText = map[nrToCords(i)[0]][nrToCords(i)[1]];
        if (map[nrToCords(i)[0]][nrToCords(i)[1]] == "¤") {
            document.getElementById(i).className += "bomb ";
        } else {
            document.getElementById(i).className += "bomb_nr_"+map[nrToCords(i)[0]][nrToCords(i)[1]]+" ";
        }
    }
}

function toggleFlag(nr) {
    if (flags.includes(nr)) {
        flags.splice(flags.indexOf(nr), 1);
        document.getElementById("flag_"+nr).className = "";
    } else if (!open_fields.includes(nr)) {
        flags.push(nr);
        document.getElementById("flag_"+nr).className = "flag_shown";
    }
    document.getElementById("bomb_count").innerText = (bomb_amount-flags.length)<10 ? "0"+String(bomb_amount-flags.length) : bomb_amount-flags.length;
    
    if (open_fields.length + flags.length == size*size) {
        gameEnd(true); // Won
    }
}

function openField(nr, check_for_bomb=true) {
    if (!flags.includes(nr)) {
        if (check_for_bomb && map[nrToCords(nr)[0]][nrToCords(nr)[1]] == "¤") {
            gameEnd(false); // Died
        }

        if (!open_fields.includes(nr)) { // Not yet opened
            open_fields.push(nr);
            document.getElementById(nr).className += "open_field ";
        } else { // Already open
            openAllIfFlagged(nr);
        }
    }

    if (open_fields.length + flags.length == size*size) {
        gameEnd(true); // Won
    }
}

function openMoreIfZero(nr) {
    if (map[nrToCords(nr)[0]][nrToCords(nr)[1]] == 0) {
        openAround(nr, false);
    }
}

function openAllIfFlagged(nr) {
    let flag_count = 0;
    for (let x1=-1; x1 <= 1; x1++) {
        for (let y1=-1; y1 <= 1; y1++) {
            if (flags.includes(cordsToNr(nrToCords(nr)[0]+x1, nrToCords(nr)[1]+y1))) {
                flag_count++;
            }
        }
    }
    if (flag_count == map[nrToCords(nr)[0]][nrToCords(nr)[1]]) {
        openAround(nr);
    }
}

function openAround(nr, check_for_bomb=true) {
    for (let x1=-1; x1 <= 1; x1++) {
        for (let y1=-1; y1 <= 1; y1++) {
            if (nrToCords(nr)[0]+x1 >= 0 && nrToCords(nr)[0]+x1 < size && nrToCords(nr)[1]+y1 >= 0 && nrToCords(nr)[1]+y1 < size) {
                if (!open_fields.includes(cordsToNr(nrToCords(nr)[0]+x1, nrToCords(nr)[1]+y1)) && !flags.includes(cordsToNr(nrToCords(nr)[0]+x1, nrToCords(nr)[1]+y1))) {
                    openField(cordsToNr(nrToCords(nr)[0]+x1, nrToCords(nr)[1]+y1), check_for_bomb);
                    openMoreIfZero(cordsToNr(nrToCords(nr)[0]+x1, nrToCords(nr)[1]+y1));
                }
            }
        }
    }
}


function nrToCords(nr) {
    let x = nr%size;
    let y = Math.floor(nr/size);

    return [x, y];
}
function cordsToNr(x, y) {
    let nr = x+size*y;

    return nr;
}



function startTimer() {
    let time_counter = setInterval(function() {
        // If game was lost or won
        if (stop_timer) {
            clearInterval(time_counter);
        }


        timer ++;
    
        let min = "0"+String(Math.floor(timer/60));
        let sec = "0"+String(timer%60);
    
        document.getElementById("timer").innerText = min.substring(min.length - 2)+":"+sec.substring(sec.length - 2);
      
    }, 1000);
}




function gameEnd(won) {
    let board_div = document.getElementById("game_board");
    board_div.className += "game_end ";

    for (let nr of flags) {
        document.getElementById(nr).className += "open_field ";
    }

    stop_timer = true;
    if (won) {
        document.getElementById("won_gif").style.display = "block";
        document.getElementById("bomb_count").className = "won";
        document.getElementById("timer").className = "won";
        console.log("You won!");
    } else {
        document.getElementById("lost_gif").style.display = "block";
        console.log("You lost");
    }
}

function restartGame() {
    // Reset variables
    map = undefined;

    flags = [];
    open_fields = [];

    timer = 0;
    stop_timer = false;

    bomb_amount = 0;


    let board_div = document.getElementById("game_board");
    // Remove previus classes and styling
    board_div.className = "";
    
    document.getElementById("won_gif").style.display = "none";
    document.getElementById("lost_gif").style.display = "none";
    
    document.getElementById("bomb_count").className = "";
    document.getElementById("timer").className = "";

    // Reset game stat visuals
    document.getElementById("bomb_count").innerText = "00";
    document.getElementById("timer").innerText = "00:00";


    // Create new board
    board_div.style.gridTemplateColumns = "repeat("+size+", 1fr)";
    board_div.innerHTML = "";
    for (let i=0; i < size*size; i++) {
        board_div.innerHTML += `
        <div id="${i}" onclick="leftClicked(${i})" oncontextmenu="rightClicked(${i});return false;">
            <div id="flag_${i}"><div class="svg_flag"></div></div>
            <span id="map_nr_${i}"></span>
        </div>
        `;
    }
}






function displayColorsOnHTML() {
    let board_bg_div = document.getElementById("game_board_bg")
    let r = document.querySelector(':root');

    board_bg_div.style.backgroundColor = modes[mode][color].bg;
    board_bg_div.style.color = modes[mode][color].font;
    r.style.setProperty('--bomb_color', modes[mode][color].bomb);
    r.style.setProperty('--board_color', modes[mode][color].board);
}




function displaySettingsOnHTML() {
    document.getElementById("map_size").value = size;
}

function showSettings() {
    let setting_div = document.getElementById("settings");
    let open_btn = document.getElementById("open_setting_btn");
    let save_btn = document.getElementById("save_setting_btn");
    let reset_btn = document.getElementById("restart_btn");

    if (setting_div.style.display != "block") {
        reset_btn.style.display = "none";
        open_btn.style.display = "none";
        save_btn.style.display = "block";
        setting_div.style.display = "block";
    } else {
        reset_btn.style.display = "block";
        open_btn.style.display = "block";
        save_btn.style.display = "none";
        setting_div.style.display = "none";
    }
}

function saveSettings() {
    let all_correct = true;

    let map_size_val = document.getElementById("map_size").value;
    if (map_size_val%2 != 0 && map_size_val > 0 && map_size_val < 22) {
        size = map_size_val;
        document.getElementById("map_size_note").style.display = "none";
    } else {
        all_correct = false;
        document.getElementById("map_size_note").style.display = "block";
    }

    let bomb_percent_val = document.getElementById("bomb_percent").value;
    if (bomb_percent_val >= 1) {
        bomb_percent = bomb_percent_val;
        document.getElementById("bomb_percent_note").style.display = "none";
    } else {
        all_correct = false;
        document.getElementById("bomb_percent_note").style.display = "block";
    }

    if (all_correct) {
        showSettings();
    }
}