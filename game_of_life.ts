const WIDTH : number = 700;
const HEIGHT : number = 700;

let SQUARES_COUNT : number = 50;
let CELL_COUNT : number = 1250;
let RUNNING : boolean = false;




/**
 * JS does comparison of objects in Set by reference, not value. So we store and compare cells as strings and convert them
 * back.
 */

interface Cell {
    x : number
    y : number
} 

const cellToString = (cell : Cell) => {
    return cell.x + "_" + cell.y;
}

const stringToCell = (cellStr : string) => {
    let parsed : Array<string> = cellStr.split("_");
    return {x : parseInt(parsed[0]), y : parseInt(parsed[1])};
}

const drawCell = (cell : Cell, context : any) => {
    const cellSize = WIDTH/SQUARES_COUNT;
    context.rect(cell.x * cellSize, cell.y * cellSize, WIDTH/SQUARES_COUNT, HEIGHT/SQUARES_COUNT)
    context.fill();
}

const drawGrid = (context : any) => {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.beginPath();
    for (let i : number = 0; i < HEIGHT; i += (HEIGHT / SQUARES_COUNT )){
        context.moveTo(0, i);
        context.lineTo(WIDTH, i);
    }

    for (let i : number = 0; i < WIDTH; i += (HEIGHT / SQUARES_COUNT )){
        context.moveTo(i, 0);
        context.lineTo(i, WIDTH);
    }
    context.stroke();
}

//Generate ranodm coordinates for given anmount of cells
const generateRandomSeed = (cellCount : number) => {
    console.log(cellCount)
    let state = new Set<string>; 
    for (let i : number = 0; i < cellCount; i++){
        let x : number = Math.floor(Math.random() * SQUARES_COUNT);
        let y : number = Math.floor(Math.random() * SQUARES_COUNT);
        state.add(cellToString({x, y}))
    }
    return state;
}

const getNeighbourCells = (cell : Cell) => {
    let neighbours : Set<string> = new Set<string>;
    
    neighbours.add(cellToString({x : cell.x + 1, y : cell.y}));
    neighbours.add(cellToString({x : cell.x + 1, y : Math.max(cell.y - 1, 0)}));
    neighbours.add(cellToString({x : cell.x + 1, y : cell.y + 1}));

    neighbours.add(cellToString({x : cell.x, y : cell.y + 1}));
    neighbours.add(cellToString({x : cell.x, y : Math.max(cell.y - 1, 0)}));

    neighbours.add(cellToString({x : Math.max(cell.x - 1, 0), y : cell.y + 1}));
    neighbours.add(cellToString({x : Math.max(cell.x - 1, 0), y : cell.y}));
    neighbours.add(cellToString({x : Math.max(cell.x - 1, 0), y : Math.max(cell.y - 1, 0)}));

    return neighbours;
}

const nextGeneration = (generation : number, liveCells : Set<string>, ctx : any) => {
    let startTime : number = Date.now();
    
    //console.log("Starting generation " + generation + ". Live cells " + liveCells.size + ".");
    drawGrid(ctx);
    liveCells.forEach((cell) =>  drawCell(stringToCell(cell), ctx))
    let dyingCells : Set<string> = new Set<string>
    let cellsCommingToLife : Set<string> = new Set<string>

    //List of adepts who can come to life - neighbours of live cells
    let canComeToLife : Set<string> = new Set<string>

    liveCells.forEach((cell) => {
        
        let neighbours : Set<string> = getNeighbourCells(stringToCell(cell));
        let liveNeighbours : number = 0;
        
        neighbours.forEach((neighbour) => {
            liveCells.has(neighbour) ? liveNeighbours += 1 : false;
            canComeToLife.add(neighbour);
        })

        //The cell dies due to under or over population
        if (liveNeighbours !== 2 && liveNeighbours !== 3){
            dyingCells.add(cell);
        }
    })

    canComeToLife.forEach((cell) => {
        let neighbours : Set<string> = getNeighbourCells(stringToCell(cell));
        let liveNeighbours : number = 0;
        
        neighbours.forEach((neighbour) => {
            liveCells.has(neighbour) ? liveNeighbours += 1 : false;
        })

        if (liveNeighbours === 3 && !liveCells.has(cell)) {
            cellsCommingToLife.add(cell);
        }
    })

    cellsCommingToLife.forEach((cell) => {
        liveCells.add(cell);
    })

    dyingCells.forEach((cell) => {
        liveCells.delete(cell);
    })


    let endTime : number = Date.now();
    document.getElementById("timePerGeneration").textContent = `${(endTime - startTime)}ms and running!`;
    document.getElementById("generationNumber").textContent = ` ${generation} generation. `;

}

const startGame = () => {
    if (RUNNING){
        return;
    }
    RUNNING = true;
    let liveCells : Set<string> = generateRandomSeed(CELL_COUNT);
    let ctx : any = gameSetup()
    liveCells.forEach(cell => drawCell(stringToCell(cell), ctx))
    let generation : number = 1;
    var int = setInterval(() => {
        if (RUNNING){
            nextGeneration(generation ++, liveCells, ctx);
        }
        else {
            clearInterval(int);
        }
    }, 300);
}

const gameSetup = () => {
    console.log("setup")
    const canvas : any= document.getElementById("drawBoard");
    const ctx : any= canvas.getContext("2d");
    drawGrid(ctx);
    return ctx;

}

document.getElementById("start").addEventListener("click", startGame);
document.getElementById("stop").addEventListener("click", () => {
    RUNNING = false;
});

document.getElementById("size").addEventListener("input", (ev) => {
    const inputElement = ev.target as HTMLInputElement;
    SQUARES_COUNT = parseInt(inputElement.value);
    gameSetup();
})

document.getElementById("cellCount").addEventListener("input", (ev) => {
    const inputElement = ev.target as HTMLInputElement;
    CELL_COUNT = parseInt(inputElement.value);
    gameSetup();
})

