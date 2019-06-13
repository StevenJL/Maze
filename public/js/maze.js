// Load WASM file on client side
import_config = {
    env: {
        abort(msg, file, line, column) {
            console.error("abort called at main.ts:" + line + ":" + column);
        }
    }
}
var wasm;
WebAssembly.instantiateStreaming(fetch('wasm/optimized.wasm'), import_config)
    .then(results => {
        // What to do on load
        wasm = results.instance.exports;
        wasm.clearMaze();
    });

var MOUSE_DOWN = false;
document.onmousedown = function (){MOUSE_DOWN = true;}
document.onmouseup = function (){MOUSE_DOWN = false;}

var GRID_SIZE = 50;

// Build maze components in html
maze = document.getElementsByClassName("maze")[0];
for(var y = 0; y < GRID_SIZE; y++){
    var row = document.createElement("div");
    row.className = "row";
    row.id = y;
    for(var x = 0; x < GRID_SIZE; x++){
        var cell = document.createElement("div");
        cell.className = "cell";
        cell.id = `${x},${y}`;
        let i = x;
        let j = y;
        cell.onclick = function () {
            clickCell(i, j);
        }
        cell.onmousemove = function () {
            mouseMoveCell(i, j);
        }
        row.appendChild(cell);
    }
    maze.appendChild(row);
}


var DISTANCES_DIRTY = false; // Set true when distances need to be recomputed
setInterval(function () {
    if (DISTANCES_DIRTY && CHEESE_X != null && CHEESE_Y != null)
    {
        wasm.computeDistances(CHEESE_X, CHEESE_Y);
        DISTANCES_DIRTY = false;
    }
}, 100);

var SOLVING = false; // Set true when distances need to be recomputed
setInterval(function () {
    if (SOLVING && MOUSE_X != null && CHEESE_X != null && !DISTANCES_DIRTY)
    {
        renderMaze();
        renderSolution(MOUSE_X, MOUSE_Y);
    }
}, 100);

var CHEESE_X, CHEESE_Y;
var MOUSE_X, MOUSE_Y;
const clickCell = (x, y) => {
    if (![2,3].includes(CURSOR_OBJECT)) {
        return;
    }

    wasm.setMaze(x, y, CURSOR_OBJECT);
    if(CURSOR_OBJECT == 2) {
        if (CHEESE_X != null
            && CHEESE_Y != null) {
            wasm.setMaze(CHEESE_X, CHEESE_Y, 0);
        }
        CHEESE_X = x;
        CHEESE_Y = y;
        DISTANCES_DIRTY = true;
    }
    if(CURSOR_OBJECT == 3) {
        if (MOUSE_X != null
            && MOUSE_Y != null) {
            wasm.setMaze(MOUSE_X, MOUSE_Y, 0);
        }
        MOUSE_X = x;
        MOUSE_Y = y;
    }

    renderMaze();
}
const mouseMoveCell = (x, y) => {
    if (![0,1].includes(CURSOR_OBJECT)) {
        return;
    }
    if (MOUSE_DOWN) {
        wasm.setMaze(x, y, CURSOR_OBJECT);
        DISTANCES_DIRTY = true;
        renderMaze();
    }
}

// Generate a random maze
const randomMaze = () => {
    wasm.clearMaze();

    // Random walls
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (Math.random() < 0.3) {
                wasm.setMaze(x, y, 1);
            }
        }
    }
}

const setColor = (x, y, color) => {
    maze = document.getElementsByClassName("maze")[0];
    cell = maze.children[y].children[x];
    cell.style.backgroundColor = color;
}

const renderMaze = () => {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            var color;
            v = wasm.getMaze(x, y);
            if (v == 0) color = "white"; // White Path
            else if (v == 1) color = "black"; // Black Wall
            else if (v == 2) color = "#f2da29"; // Yellow Cheese
            else if (v == 3) color = "#898072"; // Grey Mouse
            else {
                console.log(v);
                color = "red"; // Red Error
            }
            setColor(x, y, color);
        }
    }
};

const renderSolution = (x, y) => {
    setColor(x, y, "#4ee0b4");

    d = wasm.getDistance(x,y);
    if (x > 0 && wasm.getDistance(x-1,y) < d) {
        renderSolution(x-1,y);
    }
    else if (x < GRID_SIZE-1 && wasm.getDistance(x+1,y) < d) {
        renderSolution(x+1,y);
    }
    else if (y > 0 && wasm.getDistance(x,y-1) < d) {
        renderSolution(x,y-1);
    }
    else if (y < GRID_SIZE-1 && wasm.getDistance(x,y+1) < d) {
        renderSolution(x,y+1);
    }
}

// BUTTONS

var CURSOR_OBJECT = 1; // Default to wall

const setCursorObject = (v) => {
    CURSOR_OBJECT = v;
}

document.getElementById("button-clear").onclick = function () {
    wasm.clearMaze();
    MOUSE_X = null;
    MOUSE_Y = null;
    CHEESE_X = null;
    CHEESE_Y = null;
    renderMaze();
}
document.getElementById("button-fill").onclick = function () {
    wasm.fillMaze();
    MOUSE_X = null;
    MOUSE_Y = null;
    CHEESE_X = null;
    CHEESE_Y = null;
    renderMaze();
}
document.getElementById("button-random").onclick = function () {
    randomMaze();
    renderMaze();
}
var blah;
document.getElementById("button-solve").onclick = function (e) {
    SOLVING = !SOLVING;
    if (SOLVING) {
        this.innerText = "Toggle Solving (On)";
    }
    if (!SOLVING) {
        this.innerText = "Toggle Solving (Off)";
        renderMaze();
    }
}
