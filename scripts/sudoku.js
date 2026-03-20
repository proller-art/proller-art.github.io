// --- OUTER VARS ---
let pause = false;
let backtrack = 0;
let notes = new Map(); // A1 : (can1 : true)
let difficulty = 48;
let difficultyIncrease = 2;
let keyControl = false;
let keyShift = false;
let muted = true;

// --- SETUP ---
const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const borderSize = "5px";
const darkBorder = "#141414";
// generate 9x9 of cols
for (let r = 0; r < 9; r ++) {
    let row = document.createElement("div");
    row.classList.add("row");
    for (let c = 0; c < 9; c++) {
        let col = document.createElement("div");
        col.classList.add("col");
        // outer borders
        if (r == 0) {
            col.classList.add("topEdge");
        } else if (r == 8) {
            col.classList.add("bottomEdge");
        }
        if (c == 0) {
            col.classList.add("leftEdge");
        } else if (c == 8) {
            col.classList.add("rightEdge");
        }
        // // inner borders
        if (r == 3 || r == 6) {
            col.classList.add("innerHori");
        }
        if (c == 3 || c == 6) {
            col.classList.add("innerVert");
        }

        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = colLetters[c] + (r+1);
        let value = document.createElement("div");
        value.classList.add("value");
        value.innerText = "0";
        let dot = document.createElement("div");
        dot.classList.add("wrong_dot");
        let flipAudio = new Audio("media/extras/sudoku/flip" + Math.floor(Math.random()*4) + ".mp3");

        for (let i = 0; i < 9; i++) {
            let candidate = document.createElement("div");
            candidate.classList.add("candidate");
            candidate.classList.add("can" + (i+1));
            candidate.innerText = i+1;
            cell.appendChild(candidate);
        }
        
        cell.classList.add("empty");
        cell.classList.add("flip");
        cell.style.animationDuration = "0s, 0s";

        cell.onclick = () => selectCell(cell);

        cell.appendChild(flipAudio);
        cell.appendChild(dot);
        cell.appendChild(value);
        col.appendChild(cell);
        row.appendChild(col);
    }
    board.appendChild(row);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Control") {
        keyControl = true;
    } else if (e.key === "Shift") {
        keyShift = true;
    }
    let selected = document.getElementsByClassName("selected");
    let canKeys = ["!","@","#","$","%","^","&","*","(",")"];
    if (keyShift && canKeys.includes(e.key)) {
        for (let i = 0; i < selected.length; i++) {
            noteCell(selected[i].id, `${canKeys.indexOf(e.key) + 1}`);
        }
    } else if (/[1-9]/.test(e.key)) {
        while (selected.length > 0) {
            changeCell(selected[0].id, e.key);
            selected[0].classList.remove("selected");
        }
    } else if (e.key === "Backspace" || e.key === "0") {
        while (selected.length > 0) {
            changeCell(selected[0].id, 0);
            selected[0].classList.remove("selected");
        }
    }
});
document.addEventListener("keyup", (e) => {
    if (e.key === "Control") {
        keyControl = false;
    } else if (e.key === "Shift") {
        keyShift = false;
    }
});

createBoard();

// --- FUNCTIONS ---
async function createBoard() {
    let filledCells;
    let cells;
    notes = new Map();
    do {
        // nested arrays for grid
        cells = [];
        for (let r = 0; r < 9; r++) {
            cells.push([]);
            for (let c = 0; c < 9; c++) {
                cells[r].push({value: 0, cans: [1,2,3,4,5,6,7,8,9]});
            }
        }
        backtrack = 0;
        filledCells = fillBoard(cells);
    } while (filledCells == "timeout");

    // remove some based on difficulty
    removeCells(cells, difficulty);

    // fill elements
    populateBoardElements(cells);
    await unflipBoard();
}
function fillBoard(cells) {
    if (backtrack > 10) {
        return "timeout";
    }
    let minCans = 9;
    let options = [];
    let cellsLeft = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value == 0) {
                cellsLeft++;
                if (cells[r][c].cans.length < minCans) {
                    minCans = cells[r][c].cans.length;
                    options = [{r: r, c: c}];
                    if (minCans <= 0) {
                        return null; // cell with no candidates was found, backtrack
                    }
                } else if (cells[r][c].cans.length <= minCans) {
                    options.push({r: r, c: c});
                }
            }
        }
    }
    if (cellsLeft <= 0) {
        return cells;
    }
    while (options.length > 0) {
        let index = Math.floor(Math.random()*options.length);
        let row = options[index].r;
        let col = options[index].c;
        
        let cell = cells[row][col];
        let cans = cells[row][col].cans;
        let value = cans[Math.floor(Math.random()*cans.length)];
        cell.value = value;

        // update relevant cell candidates
        let undoCans = [];
        // row
        for (let c = 0; c < 9; c++) {
            if (cells[row][c].value == 0) {
                if (cells[row][c].cans.includes(value)) {
                    cells[row][c].cans.splice(cells[row][c].cans.indexOf(value), 1);
                    undoCans.push({r: row, c: c});
                }
            }
        }
        // col
        for (let r = 0; r < 9; r++) {
            if (cells[r][col].value == 0) {
                if (cells[r][col].cans.includes(value)) {
                    cells[r][col].cans.splice(cells[r][col].cans.indexOf(value), 1);
                    undoCans.push({r: r, c: col});
                }
            }
        }
        // box
        for (let r = row - row % 3; r < row - row % 3 + 3 ; r++) {
            if (r == row) {
                continue;
            }
            for (let c = col - col % 3; c < col - col % 3 + 3; c++) {
                if (c == col) {
                    continue;
                }
                if (cells[r][c].value == 0) {
                    if (cells[r][c].cans.includes(value)) {
                        cells[r][c].cans.splice(cells[r][c].cans.indexOf(value), 1);
                        undoCans.push({r: r, c: c});
                    }
                }
            }
        }
        let result = fillBoard(cells);
        if (result == "timeout") {
            return "timeout";
        } else if (result) {
            return cells;
        }
        // failed, undo changes
        cells[row][col].value = 0;
        for (let i = 0; i < undoCans.length; i++) {
            cells[undoCans[i].r][undoCans[i].c].cans.push(value);
        }
        options.splice(index, 1);
    }
    backtrack++;
    return null;
}
function removeCells(cells, difficulty) {
    difficulty = Math.min(65, difficulty);
    let removeOrder = [];
    let removed = 0;
    for (let i = 0; i < 81; i++) {
        removeOrder.push(i);
    }
    removeOrder = shuffle(removeOrder);
    for (let i = 0; i < 81; i++) {
        if (removed > difficulty) {
            break;
        }
        let pos = removeOrder[i];
        let cell = cells[Math.floor(pos/9)][pos%9];
        let prev = cell.value;
        cell.value = 0;
        let solutions = checkUniqueness(cells);
        if (!(solutions < 2)) {
            cell.value = prev;
        } else {
            removed++;
        }
    }
}
function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}
function checkUniqueness(cells) { // returns 0 if no solutions, 1 if unqiue solution, 2 if more than one solution
    let solutions = 0;
    let tempCells = [];
    for (let r = 0; r < 9; r++) {
        tempCells.push([]);
        for (let c = 0; c < 9; c++) {
            tempCells[r].push({r: r, c: c, value: cells[r][c].value});
        }
    }
    return solveCells(tempCells, solutions);
}
function solveCells(cells, solutions) {
    if (solutions > 1) {
        return solutions;
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value == 0) { // cell is empty
                for (let i = 1; i <= 9; i++) {
                    // place cell and check for validity
                    if (checkValidity(r, c, i, cells)) {
                        cells[r][c].value = i;
                        solutions = solveCells(cells, solutions);
                        if (solutions < 2) { // uniquness is still valid, keep checking
                            cells[r][c].value = 0;
                            continue;
                        } else { // more than one solution has been found, stop checking
                            return solutions;
                        }
                    }
                }
                // no valid values were found, backtrack
                cells[r][c].value = 0;
                return solutions;
            }
        }
    }
    return solutions + 1;
}
function checkValidity(row, col, value, cells) {
    // check row
    for (let c = 0; c < 9; c++) {
        if (c == col) {
            continue;
        }
        if (cells[row][c].value == value) {
            return false;
        }
    }
    // check col
    for (let r = 0; r < 9; r++) {
        if (r == row) {
            continue;
        }
        if (cells[r][col].value == value) {
            return false;
        }
    }
    // check box
    for (let r = row - row % 3; r < row - row % 3 + 3; r++) {
        if (r == row) {
            continue;
        }
        for (let c = col - col % 3; c < col - col % 3 + 3; c++) {
            if (c == col) {
                continue;
            }
            if (cells[r][c].value == value) {
                return false;
            }
        }
    }
    // nothing invalidated the value placement, return true
    return true;
}
function checkCell(coord, prev) {
    let valid = true;
    coord = coord.toUpperCase();
    let givenCell = document.getElementById(coord);
    let givenValue = givenCell.getElementsByClassName("value")[0].innerText;
    let rowIndex = coord.substr(1, 2) - 1;
    let colIndex = colLetters.indexOf(coord.substr(0,1));

    // row
    let row = document.getElementsByClassName("row")[rowIndex];
    let rowCells = row.getElementsByClassName("cell");
    for (let i = 0; i < rowCells.length; i++) {
        if (i == colIndex) {
            continue;
        }
        let cell = rowCells[i];
        let value = cell.getElementsByClassName("value")[0].innerText;
        if (value == givenValue && givenValue != 0) {
            valid = false;
            cell.classList.add("wrong");
            if (!givenCell.classList.contains("wrong")) {
                givenCell.classList.add("wrong");
            }
        } else if (value == prev) {
            if (cell.classList.contains("wrong")) {
                cell.classList.remove("wrong");
            }
        }
    }

    // col
    let rows = document.getElementsByClassName("row");
    for (let i = 0; i < rows.length; i++) {
        if (i == rowIndex) {
            continue;
        }
        let cell = rows[i].getElementsByClassName("col")[colIndex].getElementsByClassName("cell")[0];
        let value = cell.getElementsByClassName("value")[0].innerText;
        if (value == givenValue && givenValue != 0) {
            valid = false;
            cell.classList.add("wrong");
            if (!givenCell.classList.contains("wrong")) {
                givenCell.classList.add("wrong");
            }
        } else if (value == prev) {
            if (cell.classList.contains("wrong")) {
                cell.classList.remove("wrong");
            }
        }
    }

    // box
    for (let r = rowIndex - rowIndex % 3; r < rowIndex - rowIndex % 3 + 3 ; r++) {
        if (r == rowIndex) {
            continue;
        }
        let cols = rows[r].getElementsByClassName("col");
        for (let c = colIndex - colIndex % 3; c < colIndex - colIndex % 3 + 3; c++) {
            if (c == colIndex) {
                continue;
            }
            let cell = cols[c].getElementsByClassName("cell")[0];
            let value = cell.getElementsByClassName("value")[0].innerText;
            if (givenValue == value && givenValue != 0) {
                valid = false;
                cell.classList.add("wrong");
                if (!givenCell.classList.contains("wrong")) {
                    givenCell.classList.add("wrong");
                }
            } else if (value == prev) {
                if (cell.classList.contains("wrong")) {
                    cell.classList.remove("wrong");
                }
            }
        }
    }
    if (valid && givenCell.classList.contains("wrong")) {
        givenCell.classList.remove("wrong");
    }
    return valid;
}
async function changeCell(coord, value, color, user) {
    let cell = document.getElementById(coord);
    let valueEl = cell.getElementsByClassName("value")[0];
    if (cell.classList.contains("locked")) {
        return;
    }

    valueEl.style.color = color;
    await flipCell(coord);
    let prev = valueEl.innerText;
    valueEl.innerText = value;
    if (value == 0) {
        cell.classList.add("empty");
    } else {
        cell.classList.remove("empty");
    }
    updateCandidates();
    await unflipCell(coord);
    valueEl.style.color = null;
    checkCell(coord, prev);
    if (board.getElementsByClassName("empty").length == 0) {
        checkComplete();
    }
}
function noteCell(coord, value) {
    let cell = document.getElementById(coord);
    if (cell.classList.contains("locked")) {
        return;
    }
    let can = cell.getElementsByClassName("can" + value)[0];

    let display = true;
    if (can.style.display) {
        display = false;
    }

    if (!notes.has(coord)) {
        notes.set(coord, new Map([
            ["can" + value, !display]
        ]));
    } else {
        notes.get(coord).set("can" + value, !display);
    }
    if (display) {
        can.style.display = "none";
    } else {
        can.style.display = null;
    }
}    
function selectCell(cell) {
    let select = true;
    if (cell.classList.contains("selected")) {
        select = false;
    }
    // remove selected class for all other cells
    if (!keyShift) {
        let selected = document.getElementsByClassName("selected");
        while (selected.length > 0) {
            selected[0].classList.remove("selected");
            selected = document.getElementsByClassName("selected");
        }
    }
    if (select) {
        cell.classList.add("selected");
    } else {
        cell.classList.remove("selected");
    }
    
}   
function populateBoardElements(cells) {
    let rows = board.getElementsByClassName("row");
    for (let r = 0; r < 9; r++) {
        let cols = rows[r].getElementsByClassName("col");
        for (let c = 0; c < 9; c++) {
            let cell = cols[c].getElementsByClassName("cell")[0];
            let value = cell.getElementsByClassName("value")[0];
            if (cells[r][c].value == 0) {
                cell.classList.add("empty");
                cell.classList.remove("locked");
                value.innerText = 0;
            } else {
                cell.classList.remove("empty");
                cell.classList.add("locked");
                value.innerText = cells[r][c].value;
            }
        }
    }
    updateCandidates();
}
function updateCandidates() {
    // turn all candidates on
    for (let i = 0; i < 9; i++) {
        let cans = board.getElementsByClassName("can" + (i+1));
        for (let j = 0; j < cans.length; j++) {
            cans[j].style.display = null;
        }
    }

    let rows = board.getElementsByClassName("row");
    // rows
    for (let r = 0; r < 9; r++) {
        let used = new Set();
        let row = rows[r];
        let cols = row.getElementsByClassName("col");
        for (let c = 0; c < 9; c++) {
            let value = cols[c].getElementsByClassName("value")[0].innerText;
            if (value != 0) {
                used.add(value);
            }
        }
        for (let i = 0; i < 9; i++) {
            if (used.has(`${i+1}`)) {
                let cans = row.getElementsByClassName("can" + (i+1));
                for (let j = 0; j < 9; j++) {
                    cans[j].style.display = "none";
                }
            }
        }
    }

    // cols
    for (let c = 0; c < 9; c++) {
        let used = new Set();
        for (let r = 0; r < 9; r++) {
            let value = rows[r].getElementsByClassName("value")[c].innerText;
            if (value != 0) {
                used.add(value);
            }
        }
        for (let i = 0; i < 9; i++) {
            if (used.has(`${i+1}`)) {
                for (let r = 0; r < 9; r++) {
                    let can = rows[r].getElementsByClassName("can" + (i+1))[c];
                    can.style.display = "none";
                }
            }
        }
    }

    // boxes
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let used = new Set();
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    let value = rows[r].getElementsByClassName("value")[c].innerText;
                    if (value != 0) {
                        used.add(value);
                    }
                }
            }
            for (let i = 0; i < 9; i++) {
                if (used.has(`${i+1}`)) {
                    for (let r = br * 3; r < br * 3 + 3; r++) {
                        for (let c = bc * 3; c < bc * 3 + 3; c++) {
                            let can = rows[r].getElementsByClassName("can" + (i+1))[c];
                            can.style.display = "none";
                        }
                    }
                }
            }
        }
    }

    // notes
    notes.forEach((cans, coord) => {
        let cell = document.getElementById(coord);
        cans.forEach((display, can) => {
            if (display) {
                cell.getElementsByClassName(can)[0].style.display = null;
            } else {
                cell.getElementsByClassName(can)[0].style.display = "none";
            }
            
        });
    });
}
async function flipBoard() {
    let duration = 0;
    let rows = board.getElementsByClassName("row");
    for (let r = 0; r < 9; r++) {
        let cols = rows[r].getElementsByClassName("col");
        for (let c = 0; c < 9; c++) {
            let delay = r*.22 + c*.10 + Math.max(Math.floor(Math.random()*1000), 998)%998*4;
            duration = Math.max(duration, delay + 1);
            let cell = cols[c].getElementsByClassName("cell")[0];
            let flipAudio = cell.querySelector("audio");
            let value = cell.getElementsByClassName("value")[0];
            let wrongDot = cell.getElementsByClassName("wrong_dot")[0];

            cell.style.animationDuration = null;
            cell.classList.remove("unflip");
            value.classList.remove("unflip");
            wrongDot.classList.remove("unflip");
            void cell.offsetHeight;
            void value.offsetHeight;
            void wrongDot.offsetHeight;
            cell.classList.add("flip");
            value.classList.add("flip");
            wrongDot.classList.add("flip");
            cell.style.animationDelay = delay + "s, " + delay + "s";
            value.style.animationDelay = delay + "s";
            wrongDot.style.animationDelay = delay + "s";

            let cans = cell.getElementsByClassName("candidate");
            for (let i = 0; i < cans.length; i++) {
                cans[i].classList.remove("unflip");
                void cans[i].offsetHeight;
                cans[i].classList.add("flip");
                cans[i].style.animationDelay = delay + "s";
            }
            setTimeout(() => {
                if (!muted) {
                    flipAudio.play();
                }
            }, delay*1000+200);
        }
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration * 1000);
    });
}
async function unflipBoard() {
    let duration = 0;
    let rows = board.getElementsByClassName("row");
    for (let r = 0; r < 9; r++) {
        let cols = rows[r].getElementsByClassName("col");
        for (let c = 0; c < 9; c++) {
            let delay = r*.22 + c*.10 + Math.max(Math.floor(Math.random()*1000), 998)%998*4;
            duration = Math.max(duration, delay + 1);
            let cell = cols[c].getElementsByClassName("cell")[0];
            let flipAudio = cell.querySelector("audio");
            let value = cell.getElementsByClassName("value")[0];
            let wrongDot = cell.getElementsByClassName("wrong_dot")[0];

            cell.style.animationDuration = null;
            cell.classList.remove("flip");
            value.classList.remove("flip");
            wrongDot.classList.remove("flip");
            void cell.offsetHeight;
            void value.offsetHeight;
            void wrongDot.offsetHeight;
            cell.classList.add("unflip");
            value.classList.add("unflip");
            wrongDot.classList.add("unflip");
            cell.style.animationDelay = delay + "s, " + delay + "s";
            value.style.animationDelay = delay + "s";
            wrongDot.style.animationDelay = delay + "s";

            let cans = cell.getElementsByClassName("candidate");
            for (let i = 0; i < cans.length; i++) {
                cans[i].classList.remove("flip");
                void cans[i].offsetHeight;
                cans[i].classList.add("unflip");
                cans[i].style.animationDelay = delay + "s";
            }
            setTimeout(() => {
                if (!muted) {
                    flipAudio.play();
                }
            }, delay*1000+200);
        }
    }
    setTimeout(() => {
        return;
    }, duration * 1000);
}
async function flipCell(coord) {
    let cell = document.getElementById(coord);
    let flipAudio = cell.querySelector("audio");
    let value = cell.getElementsByClassName("value")[0];
    let wrongDot = cell.getElementsByClassName("wrong_dot")[0];

    cell.classList.remove("unflip");
    value.classList.remove("unflip");
    wrongDot.classList.remove("unflip");
    void cell.offsetHeight;
    void value.offsetHeight;
    void wrongDot.offsetHeight;
    cell.classList.add("flip");
    value.classList.add("flip");
    wrongDot.classList.add("flip");
    cell.style.animationDelay = "0s";
    value.style.animationDelay = "0s";
    wrongDot.style.animationDelay = "0s";

    let cans = cell.getElementsByClassName("candidate");
    for (let i = 0; i < cans.length; i++) {
        cans[i].classList.remove("unflip");
        void cans[i].offsetHeight;
        cans[i].classList.add("flip");
        cans[i].style.animationDelay = "0s";
    }

    setTimeout(() => {
        if (!muted) {
            flipAudio.play();
        }
    }, 200);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}
async function unflipCell(coord) {
    let cell = document.getElementById(coord);
    let flipAudio = cell.querySelector("audio");
    let value = cell.getElementsByClassName("value")[0];
    let wrongDot = cell.getElementsByClassName("wrong_dot")[0];

    cell.classList.remove("flip");
    value.classList.remove("flip");
    wrongDot.classList.remove("flip");
    void cell.offsetHeight;
    void value.offsetHeight;
    void wrongDot.offsetHeight;
    cell.classList.add("unflip");
    value.classList.add("unflip");
    wrongDot.classList.add("unflip");
    cell.style.animationDelay = "0s";
    value.style.animationDelay = "0s";
    wrongDot.style.animationDelay = "0s";

    let cans = cell.getElementsByClassName("candidate");
    for (let i = 0; i < cans.length; i++) {
        cans[i].classList.remove("flip");
        void cans[i].offsetHeight;
        cans[i].classList.add("unflip");
        cans[i].style.animationDelay = "0s";
    }

    setTimeout(() => {
        if (!muted) {
            flipAudio.play();
        }
    }, 200);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}
async function checkComplete() {
    if (board.getElementsByClassName("wrong").length == 0) {
        difficulty += difficultyIncrease;
        await flipBoard();
        createBoard();
    }
}