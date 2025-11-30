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
    private trueLargeBoard: Cell[][] = [];

    private createSmallBoard(): SmallBoard {
        return Array.from({ length: 3}, () => 
            Array.from({ length: 3}, () => ""));
    }

    private createlargeBoard(): LargeBoard {
        return Array.from( {length: 3 }, () =>
            Array.from({ length: 3 }, ()=> this.createSmallBoard()));
    }

    private checkBoardWin(board: SmallBoard): boolean {
        for (let i = 0; i < 3; i++) {
            if (board[i][0] !== "" && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
                return true;
            }
        }
        for (let i = 0; i < 3; i++) {
            if (board[0][i] !== "" && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
                return true;
            }
        }
        if (board[0][0] !== "" && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            return true;
        }
        if (board[0][2] !== "" && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            return true;
        }
        return false;
    }

    // get the lrow and lcol to lock to
    private lockBoards(lrow: number, lcol: number) {
        // if the board is already won, do nothing
        if (this.trueLargeBoard[lrow][lcol] !== "") {
            return ;
        }
        
    }

    private makeMove(lrow: number, lcol: number, srow: number, scol: number, current_move: HTMLParagraphElement, cell: HTMLDivElement) {
        if (this.largeBoard[lrow][lcol][srow][scol] !== "") {
            console.log("Cell is already filled");
            return ;
        }
        this.largeBoard[lrow][lcol][srow][scol] = this.currentMove;
        const move = document.createElement("p");
        move.innerText = this.currentMove;
        move.className = "p-0 m-0 relative";
        cell.appendChild(move);
        if (this.checkBoardWin(this.largeBoard[lrow][lcol])) {
            // mark the large board cell as won
            const largeCell = document.querySelector(`div.cell[data-lrow='${lrow}'][data-lcol='${lcol}']`) as HTMLDivElement;
            const winner = document.createElement("div");
            winner.className = "large-board-winner flex justify-center items-center";
            const winnerText = document.createElement("p");
            winnerText.innerText = this.currentMove;
            winnerText.className = "text-[5rem]";
            winner.appendChild(winnerText);
            largeCell.removeChild(largeCell.firstChild!);
            largeCell.appendChild(winner);
            this.trueLargeBoard[lrow][lcol] = this.currentMove;
        }
        if (this.checkBoardWin(this.trueLargeBoard)) {
            alert(`${this.currentMove} wins the game!`);
        }
        this.currentMove = this.currentMove === "X" ? "O" : "X";
        current_move.innerText = `${this.currentMove} to move`;
        this.lockBoards(srow, scol);
        /*
            tthe next move can only move in the same [lrow][lcol] as the previous move's [srow][scol] unless that board is already won (or filled)
            this can be highlighted by the background color of the small board changing to another color
         */
    }

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        this.largeBoard = this.createlargeBoard();
        app.innerHTML += `
        <div id="main-container" class="flex flex-col justify-center items-center pt-8 h-screen">
            <div id="game-info" class="flex justify-center items-center pixel-box w-[50%] h-20">
                <p id="current-move">${this.currentMove} to move</p>
            </div>
            <div id="tictactoe-board" class="grid grid-cols-3 mt-4 pixel-box p-4 border-5 border-red-500 w-[50%] h-screen mx-auto bg-blue-900"></div>
        </div>`;
        // for each row, create 3 divs
        const board = document.getElementById("tictactoe-board")!;
        for (let i = 0; i < 3; i++) {
            // for each row, create 3 divs which represents each element
            for (let j = 0; j < 3; j++) {
                const element = document.createElement("div");
                element.className = "cell flex justify-center items-center p-6";
                element.dataset.lrow = i.toString();
                element.dataset.lcol = j.toString();
                board.appendChild(element);
                if (i > 0 && i < 3) element.style.borderTop = "5px solid black";
                if (j > 0 && j < 3) element.style.borderLeft = "5px solid black";
                const cell = document.createElement("div");
                cell.className = "small-board grid grid-cols-3 w-[75%] h-full";
                element.appendChild(cell);
                for (let sr = 0; sr < 3; sr++) {
                    for (let sc = 0; sc < 3; sc++) {
                        const small_board = document.createElement("button");
                        small_board.className = "small-board-cell flex justify-center items-center hover:bg-blue-300 hover:cursor-pointer";
                        small_board.dataset.lrow = i.toString();
                        small_board.dataset.lcol = j.toString();
                        small_board.dataset.srow = sr.toString();
                        small_board.dataset.scol = sc.toString();
                        if (sr > 0 && sr < 3) small_board.style.borderTop = "2px solid black";
                        if (sc > 0 && sc < 3) small_board.style.borderLeft = "2px solid black";
                        cell.appendChild(small_board);
                    }
                }
            }
        }
    }

    async init() {
        this.trueLargeBoard = this.createSmallBoard();
        const move = document.getElementById("current-move") as HTMLParagraphElement;
        const small_board_cells = document.querySelectorAll(".small-board-cell");
        small_board_cells.forEach((cell) => {
            cell.addEventListener("click", (event) => {
                const lrow = parseInt((event.currentTarget as HTMLDivElement).dataset.lrow!);
                const lcol = parseInt((event.currentTarget as HTMLDivElement).dataset.lcol!);
                const srow = parseInt((event.currentTarget as HTMLDivElement).dataset.srow!);
                const scol = parseInt((event.currentTarget as HTMLDivElement).dataset.scol!);
                this.makeMove(lrow, lcol, srow, scol, move, cell as HTMLDivElement);
                console.log(this.largeBoard);
            })
        });
    }
}