import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import Router from "../scripts/router";

/*
    the board is currently created with a loop that goes per column and per row
    a cell is added in the loop
    best way to figure out who the winner is 
    add a toggle for which player is currently moving
    save the large board as an array of smallboards
*/
type Cell = "" | "X" | "O";
type SmallBoard = Cell[][];
type LargeBoard = SmallBoard[][]; 

export default class TicTacToePage extends Component {
    private navbar = new NavBar(this.router);
    private currentMove: Cell = "X";
    private largeBoard: LargeBoard = [];

    private createSmallBoard(): SmallBoard {
        return Array.from({ length: 3}, () => 
            Array.from({ length: 3}, () => ""));
    }

    private createlargeBoard(): LargeBoard {
        return Array.from( {length: 3 }, () =>
            Array.from({ length: 3 }, ()=> this.createSmallBoard()));
    }

    private makeMove(current_move: HTMLParagraphElement, cell: HTMLDivElement) {
        if (cell.querySelector("#closed")) {
            console.log("Cell is already filled");
            return ;
        }
        cell.innerHTML += `<p id="closed">${this.currentMove}</p>`;
        this.currentMove = this.currentMove === "X" ? "O" : "X";
        console.log("move: ", this.currentMove);
        current_move.innerHTML = `${this.currentMove} to move`;
    }

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        this.largeBoard = this.createlargeBoard();
        app.innerHTML += `
        <div id="main-container" class="flex flex-col justify-center items-center pt-8">
            <div id="game-info" class="flex justify-center items-center pixel-box w-[50%] h-20">
                <p id="current-move">${this.currentMove} to move</p>
            </div>
            <div id="tictactoe-board" class="grid grid-cols-3 gap-2 mt-4 pixel-box p-4 border-8 w-[50%] h-150 mx-auto bg-blue-900"></div>
        </div>`;
        // for each row, create 3 divs
        const board = document.getElementById("tictactoe-board")!;
        for (let i = 0; i < 3; i++) {
            // for each row, create 3 divs which represents each element
            for (let j = 0; j < 3; j++) {
                console.log(`adding a cell for row ${i + 1}`);
                board.innerHTML += `
                <div class="cell flex justify-center items-center cursor-pointer">
                </div>`;
            }
            // for each row, add another board
        }
        const cells = document.querySelectorAll(".cell");
        for (let i = 0, length = cells.length; i < length; i++) {
            cells[i].innerHTML += `
                <div class="small-board grid grid-cols-3 w-[75%] h-full">
                </div>
            `
        }
        const small_boards = document.querySelectorAll(".small-board");
        for (let i = 0, length = small_boards.length; i < length; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    small_boards[i].innerHTML += `
                    <button class="small-board-cell flex justify-center items-center border-2 border-black hover:bg-blue-300 hover:cursor-pointer"></button>`;
                }
            }
        }
    }

    async init() {
        const move = document.getElementById("current-move") as HTMLParagraphElement;
        const small_board_cells = document.querySelectorAll(".small-board-cell");
        small_board_cells.forEach((cell) => {
            cell.addEventListener("click", (event) => {
                // cell.innerHTML += `<p>${this.currentMove}</p>`
                this.makeMove(move, cell as HTMLDivElement);
            })
        });
    }
}