
let size = 27; // Should be odd
let bomb_percent = 6; //(1/nr)
let min_start = 3; // Should be odd (nr x nr of no bomb)
const modes = {
    "Dark":{
        "Green":{"bg":"#e0c995", "font":"#000000", "board":"#2b9e4d", "bomb":"255, 0, 0"}
    },
    "Flag":{
        "Purple":{"bg":"#4424b8", "font":"#ffffff", "board":"#272031", "bomb":"255, 0, 85"},
        "Pink":{"bg":"#79b8ff", "font":"#72203f", "board":"#ffaccc", "bomb":"255, 255, 255"}
    }
}

let current_colors = {"bg":"#e0c995", "font":"#000000", "board":"#2b9e4d", "bomb":"255, 0, 0"};

displayColorsOnHTML();
displaySettingsOnHTML();

let left_click_open_field = true;

let map = undefined;

let flags = [];
let open_fields = [];

let timer = 0;
let stop_timer = false;

let bomb_amount = 0;

restartGame();



function leftClicked(nr) {
    if (left_click_open_field) {

        if (map == undefined) {
            map = newMap(nr);
            addNrToBoard();
            startTimer();
        }
        openField(nr);
        openMoreIfZero(nr);

    } else {
        // If flag_toggle is toggled (reverse)
        if (open_fields.includes(nr)) { // Stil open fields around if number is clicked
            openAllIfFlagged(nr)
        }
        toggleFlag(nr);
    }
}

function rightClicked(nr) {
    if (left_click_open_field) {

        toggleFlag(nr);

    } else {
        // If flag_toggle is toggled (reverse)
        if (map == undefined) {
            map = newMap(nr);
            addNrToBoard();
            startTimer();
        }
        openField(nr);
        openMoreIfZero(nr);
    }
}



function newMap(start) {
    let new_map = []; // Will be new_map[x][y] to get point

    for (let x=0; x < size; x++) {
        new_map.push([]);
        for (let y=0; y < size; y++) {
            if (Math.floor((Math.random() * bomb_percent)) == 0 && !isNearStart(start, x, y)) {
                new_map[x].push("¤");
                bomb_amount++;
                if (y>0 && new_map[x][y-1]!="¤") {
                    new_map[x][y-1] ++;
                }
                if (x>0 && y<size-1 && new_map[x-1][y+1]!="¤") {
                    new_map[x-1][y+1] ++;
                }
                if (x>0 && new_map[x-1][y]!="¤") {
                    new_map[x-1][y] ++;
                }
                if (x>0 && y>0 && new_map[x-1][y-1]!="¤") {
                    new_map[x-1][y-1] ++;
                }
            } else {
                new_map[x].push(0);
                if (y>0 && new_map[x][y-1]=="¤") {
                    new_map[x][y] ++;
                }
                if (x>0 && y<size-1 && new_map[x-1][y+1]=="¤") {
                    new_map[x][y] ++;
                }
                if (x>0 && new_map[x-1][y]=="¤") {
                    new_map[x][y] ++;
                }
                if (x>0 && y>0 && new_map[x-1][y-1]=="¤") {
                    new_map[x][y] ++;
                }
            }
        
        }
    }

    function isNearStart(start, x, y) {
        let start_cords = nrToCords(start);

        for (let x1=-Math.floor(min_start/2); x1<=Math.floor(min_start/2); x1++) {
            for (let y1=-1; y1<=1; y1++) {
                try {
                    if (x == start_cords[0]+x1 && y == start_cords[1]+y1) {
                        return true;
                    }
                } catch (err) { }
            }
        }

        return false;
    }


    // // Create bombs
    // for (let x=0; x < size; x++) {
    //     new_map.push([]);
    //     for (let y=0; y < size; y++) {

    //         if (Math.floor((Math.random() * bomb_percent)) == 0) {
    //             new_map[x].push("¤");
    //         } else {
    //             new_map[x].push(0);
    //         }
        
    //     }
    // }

    // // Create open start
    // let min_start = 3;
    // for (let x=-Math.floor(min_start/2); x < min_start-Math.floor(min_start/2); x++) {
    //     for (let y=-Math.floor(min_start/2); y < min_start-Math.floor(min_start/2); y++) {
    //         try {
    //             new_map[nrToCords(start)[0]+x][nrToCords(start)[1]+y] = 0;
    //         } catch (err) {
    //             // console.warn(err);
    //         }
    //     }
    // }

    // // Create numbers
    // for (let x=0; x < size; x++) {
    //     for (let y=0; y < size; y++) {

    //         if (new_map[x][y] == "¤") {
    //             bomb_amount++;

    //             for (let x1=-1; x1 <= 1; x1++) {
    //                 for (let y1=-1; y1 <= 1; y1++) {
    //                     try {
    //                         if (new_map[x+x1][y+y1] != "¤" && Number.isInteger(new_map[x+x1][y+y1])) {
    //                             new_map[x+x1][y+y1] ++;
    //                         }
    //                     } catch (err) {
    //                         // console.warn(err);
    //                     }
    //                 }
    //             }
    //         }
        
    //     }
    // }

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
    
    if (hasWon()) {
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

    if (hasWon()) {
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




function hasWon() {
    if (size*size - open_fields.length == bomb_amount) {
        return true;
    }
    return false;
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

function restartGame(from_settings=false) {
    // Save settings if needed
    if (from_settings) {
        saveSettings();
    }

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
    let HTML_txt = "";
    for (let i=0; i < size*size; i++) {
        HTML_txt += `
        <div id="${i}" onclick="leftClicked(${i})" oncontextmenu="rightClicked(${i});return false;">
        <div id="flag_${i}"><div class="svg_flag"></div></div>
        <span id="map_nr_${i}"></span>
        </div>
        `;
    }
    board_div.innerHTML = HTML_txt;
    for (let i=0; i < size*size; i++) {
        const boxHeight = document.getElementById(i).offsetHeight;
        document.getElementById(`map_nr_${i}`).style.fontSize = `${(boxHeight*(2/3)).toString()}px`;
    }
}


function rgbToHex(rgb_list) {
    function componentToHex(c) {
        var hex = parseInt(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex(rgb_list[0]) + componentToHex(rgb_list[1]) + componentToHex(rgb_list[2]);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        "r": parseInt(result[1], 16),
        "g": parseInt(result[2], 16),
        "b": parseInt(result[3], 16)
    } : null;
}





function displayColorsOnHTML() {
    let board_bg_div = document.getElementById("game_board_bg")
    let r = document.querySelector(':root');

    board_bg_div.style.color = current_colors.font;
    r.style.setProperty('--bomb_color', current_colors.bomb);
    r.style.setProperty('--board_color', current_colors.board);
    r.style.setProperty('--field_color', current_colors.bg);
}

function changeColorToPreset(mode, color) {
    current_colors = modes[mode][color];
}




function displaySettingsOnHTML() {
    document.getElementById("map_size").value = size;
    document.getElementById("bomb_percent").value = bomb_percent;

    document.getElementById("overlay_color").value = current_colors.board;
    document.getElementById("open_color").value = current_colors.bg;
    document.getElementById("text_color").value = current_colors.font;
    document.getElementById("bomb_color").value = rgbToHex(current_colors.bomb.split(", "));
}

function showSettings() {
    let setting_div = document.getElementById("settings_overlay");
    let open_btn = document.getElementById("open_setting_btn");
    let save_btn = document.getElementById("save_setting_btn");
    let reset_btn = document.getElementById("restart_btn");
    
    if (setting_div.style.display != "flex") {
        reset_btn.style.display = "none";
        open_btn.style.display = "none";
        // save_btn.style.display = "block";
        setting_div.style.display = "flex";
    } else {
        reset_btn.style.display = "block";
        open_btn.style.display = "block";
        // save_btn.style.display = "none";
        setting_div.style.display = "none";
    }
}

function saveSettings() {
    let all_correct = true;

    let map_size_val = document.getElementById("map_size").value;
    if (map_size_val%2 != 0 && map_size_val > 0) {
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

    let safe_start_val = document.getElementById("safe_start").value;
    if (safe_start_val%2 != 0 && safe_start_val >= 1) {
        min_start = safe_start_val;
        document.getElementById("safe_start_note").style.display = "none";
    } else {
        all_correct = false;
        document.getElementById("safe_start_note").style.display = "block";
    }

    current_colors.board = document.getElementById("overlay_color").value;
    current_colors.bg = document.getElementById("open_color").value;
    current_colors.font = document.getElementById("text_color").value;
    let bomb_color_hex = hexToRgb(document.getElementById("bomb_color").value)
    current_colors.bomb = bomb_color_hex["r"]+", "+bomb_color_hex["g"]+", "+bomb_color_hex["b"];

    if (all_correct) {
        displayColorsOnHTML();
        showSettings();
    }
}






function toggleClickEvent() {
    left_click_open_field = !left_click_open_field;
    let tutorial_cont = document.getElementById("tutorial_cont");
    if (tutorial_cont.className != "swap_controls") {
        tutorial_cont.className = "swap_controls";
    } else {
        tutorial_cont.className = "";
    }
}