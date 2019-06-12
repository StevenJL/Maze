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
    // Do something with the results!
    wasm = results.instance.exports;
});


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
        cell.id = x;
        row.appendChild(cell);
    }
    maze.appendChild(row);
}

// Set maze elements
const buildMaze = () => {
    wasm.clearMaze();

    // Random walls
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (Math.random() < 0.1) {
                wasm.setMaze(x, y, 1);
            }
        }
    }

    // Cheese and mouse
    wasm.setMaze(GRID_SIZE-1, GRID_SIZE-1, 2);
    wasm.setMaze(0, 0, 3);
}

const setColor = (x, y, color) => {
    maze = document.getElementsByClassName("maze")[0];
    cell = maze.children[y].children[x];
    cell.style.backgroundColor = color;
}

const renderMaze = () => {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (wasm.getMaze(x, y) > 0) {
                var color;
                if (wasm.getMaze(x, y) == 1) color = "black"; // Black Wall
                else if (wasm.getMaze(x, y) == 2) color = "yellow"; // Yellow Cheese
                else if (wasm.getMaze(x, y) == 3) color = "grey"; // Grey Mouse
                else color = "red"; // Red Error
                setColor(x, y, color);
            }
        }
    }
};

const renderSolution = (x, y) => {
    setColor(x, y, "green");

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
