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
    private lastMove: HTMLDivElement | null = null;

    private createSmallBoard(): SmallBoard {
        return Array.from({ length: 3}, () => 
            Array.from({ length: 3}, () => ""));
    }

    private createlargeBoard(): LargeBoard {
        return Array.from( {length: 3 }, () =>
            Array.from({ length: 3 }, ()=> this.createSmallBoard()));
    }

    private checkBoardWin(board: SmallBoard): boolean {
        // check if the board is fully filled
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
    private lockBoards(lrow: number, lcol: number, largeBoardCell: HTMLDivElement) {
        // if the board is already won, do nothing
        if (this.trueLargeBoard[lrow][lcol] !== "") {
            if (this.lastMove) this.lastMove.classList.remove("bg-purple-800");
            this.lastMove = null;
            return ;
        }
        const boards = document.querySelectorAll(".small-board") as NodeListOf<HTMLDivElement>;
        boards.forEach((board) => {
            // this means that this is the only board that can move
            if (board.dataset.lrow === lrow.toString() && board.dataset.lcol === lcol.toString()) {
                const large_board_cell = board.parentElement as HTMLDivElement;
                large_board_cell.classList.add("bg-purple-800");    // add the purple background to indicate that the board is active
                if (this.lastMove === null) {
                    this.lastMove = large_board_cell;
                } else {
                    if (this.lastMove !== large_board_cell) this.lastMove.classList.remove("bg-purple-800");
                    this.lastMove = large_board_cell;
                }
            }
        });
    }

    private makeMove(lrow: number, lcol: number, srow: number, scol: number, current_move: HTMLParagraphElement, cell: HTMLDivElement) {
        if (this.largeBoard[lrow][lcol][srow][scol] !== "") {
            console.log("Cell is already filled");
            return ;
        }
        if (this.lastMove !== null) {
            const parentCell = cell.parentElement?.parentElement;
            if (parentCell !== this.lastMove) {
                console.log("this board cannot move");
                return ;
            }
        }
        this.largeBoard[lrow][lcol][srow][scol] = this.currentMove;
        // cell.innerText = this.currentMove;
        const move = document.createElement("p");
        move.classList = "text-[0.5rem] md:text-[1rem]";
        move.innerText = this.currentMove;
        cell.appendChild(move);
        if (this.checkBoardWin(this.largeBoard[lrow][lcol])) {
            // mark the large board cell as won
            const largeCell = document.querySelector(`div.cell[data-lrow='${lrow}'][data-lcol='${lcol}']`) as HTMLDivElement;
            const winner = document.createElement("div");
            winner.className = "large-board-winner flex justify-center items-center aspect-square";
            const winnerText = document.createElement("p");
            winnerText.innerText = this.currentMove;
            winnerText.className = "text-[2rem]";
            winner.appendChild(winnerText);
            largeCell.removeChild(largeCell.firstChild!);
            largeCell.appendChild(winner);
            largeCell.classList.remove("bg-purple-800");
            this.trueLargeBoard[lrow][lcol] = this.currentMove;
        }
        if (this.checkBoardWin(this.trueLargeBoard)) {
            alert(`${this.currentMove} wins the game!`);
            // create a modal that contains the results and will be displayed
        }
        this.currentMove = this.currentMove === "X" ? "O" : "X";
        current_move.innerText = `${this.currentMove} to move`;
        this.lockBoards(srow, scol, cell);
    }

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        this.largeBoard = this.createlargeBoard();
        // app.innerHTML += `
        // <div id="main-container" class="flex flex-col justify-center items-center pt-8 h-screen">
        //     <div id="game-info" class="flex justify-center items-center pixel-box h-[100%] w-[50%] md:h-15">
        //         <p id="current-move" class="text-[15px] lg:text-[1rem]">${this.currentMove}'s turn</p>
        //     </div>
        //     <div id="tictactoe-board" class="grid grid-cols-3 mt-4 pixel-box p-4 border-5 border-red-500 w-[90%] md:w-[75%] lg:w-[50%] lg:h-[70%] mx-auto bg-blue-900"></div>
        // </div>`;
        app.innerHTML += `
        <div id="main-container" class="flex flex-col justify-center items-center pt-8 h-screen">
            <div id="game-info" class="flex justify-center items-center pixel-box w-[50%] md:h-15">
                <p id="current-move" class="text-[15px] lg:text-[1rem]">${this.currentMove}'s turn</p>
            </div>
            <div id="tictactoe-board" class="overflow-hidden mt-6 grid grid-cols-3 pixel-box border-5 border-red-500 w-full max-w-[80vh] h-full max-h-[80vh] bg-blue-900"></div>
        </div>`;
        // for each row, create 3 divs
        const board = document.getElementById("tictactoe-board")!;
        for (let i = 0; i < 3; i++) {
            // for each row, create 3 divs which represents each element
            for (let j = 0; j < 3; j++) {
                const large_board_cell = document.createElement("div");
                large_board_cell.className = "cell flex justify-center items-center p-1 md:p-3 h-full w-full aspect-square";
                large_board_cell.dataset.lrow = i.toString();
                large_board_cell.dataset.lcol = j.toString();
                board.appendChild(large_board_cell);
                if (i > 0 && i < 3) {
                    large_board_cell.style.borderTop = "5px solid black";
                    large_board_cell.style.marginBottom = "5px";
                }
                if (j > 0 && j < 3) {
                    large_board_cell.style.borderLeft = "5px solid black";
                }
                const small_board_container = document.createElement("div");
                small_board_container.className = "small-board grid grid-cols-3 w-[100%] h-full";
                large_board_cell.appendChild(small_board_container);
                small_board_container.dataset.lrow = i.toString();
                small_board_container.dataset.lcol = j.toString();
                for (let sr = 0; sr < 3; sr++) {
                    for (let sc = 0; sc < 3; sc++) {
                        const small_board = document.createElement("button");
                        small_board.className = "\
                        small-board-cell flex justify-center items-center h-[100%] aspect-square hover:bg-blue-300 hover:cursor-pointer";
                        small_board.dataset.lrow = i.toString();
                        small_board.dataset.lcol = j.toString();
                        small_board.dataset.srow = sr.toString();
                        small_board.dataset.scol = sc.toString();
                        if (sr > 0 && sr < 3) small_board.style.borderTop = "2px solid black";
                        if (sc > 0 && sc < 3) small_board.style.borderLeft = "2px solid black";
                        small_board_container.appendChild(small_board);
                    }
                }
            }
        }
    }

    async init() {
        this.navbar.init();
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
            })
        });
    }
}