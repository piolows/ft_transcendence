import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url, Router } from "../scripts/router";

type Cell = "" | "X" | "O";
type SmallBoard = Cell[][];
type LargeBoard = SmallBoard[][]; 

export default class TicTacToePage extends Component {
    private navbar = new NavBar(this.router);
    private currentMove: Cell = "X";
    private largeBoard: LargeBoard = [];
    private trueLargeBoard: Cell[][] = [];
    private lastMove: HTMLDivElement | null = null;
    private p1Name: string | null = null;
    private p2Name: string | null = null;
    private gameTime: number = 0;
    private interval: number | null = null;

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

    private updateInfo(currentMove: string, currentPlayer: string) {
        const game_info = document.getElementById("game-info") as HTMLDivElement;
        const current_move_icon = game_info.querySelector("#current-move-icon") as HTMLSpanElement;
        const current_move_text = game_info.querySelector("#current-move-text");
        // const time = game_info.querySelector("#time");

        if (currentMove === "X")
        {
            current_move_icon.classList!.remove("text-red-600");
            current_move_icon.classList!.add("text-blue-600");
        }
        else
        {
            current_move_icon.classList!.remove("text-blue-600");
            current_move_icon.classList!.add("text-red-600");
        }
        if (current_move_icon) current_move_icon.textContent = currentMove;
        if (current_move_text) current_move_text.textContent = `${currentMove}'s Turn (${currentPlayer})`;
    }

    private lockBoards(lrow: number, lcol: number, largeBoardCell: HTMLDivElement) {
        // if the board is already won, do nothing
        if (this.trueLargeBoard[lrow][lcol] !== "") {
            if (this.lastMove) {
                this.lastMove.classList.remove("active-board");
                this.lastMove.classList.remove("ring-4", "ring-yellow-400", "shadow-[0_0_20px_rgba(250,204,21,0.5)]");
            }
            this.lastMove = null;
            
            // Enable all non-won boards
            const boards = document.querySelectorAll(".cell") as NodeListOf<HTMLDivElement>;
            boards.forEach((board) => {
                const brow = parseInt(board.dataset.lrow!);
                const bcol = parseInt(board.dataset.lcol!);
                if (this.trueLargeBoard[brow][bcol] === "") {
                    board.classList.remove("opacity-40", "pointer-events-none");
                    board.classList.add("opacity-100");
                }
            });
            return;
        }
        
        const boards = document.querySelectorAll(".cell") as NodeListOf<HTMLDivElement>;
        boards.forEach((board) => {
            const brow = parseInt(board.dataset.lrow!);
            const bcol = parseInt(board.dataset.lcol!);
            
            if (brow === lrow && bcol === lcol) {
                // This is the active board
                board.classList.add("active-board", "ring-4", "ring-yellow-400", "shadow-[0_0_20px_rgba(250,204,21,0.5)]");
                board.classList.remove("opacity-40", "pointer-events-none");
                board.classList.add("opacity-100");
                
                if (this.lastMove === null) {
                    this.lastMove = board;
                } else {
                    if (this.lastMove !== board) {
                        this.lastMove.classList.remove("active-board", "ring-4", "ring-yellow-400", "shadow-[0_0_20px_rgba(250,204,21,0.5)]");
                    }
                    this.lastMove = board;
                }
            } else {
                // This is an inactive board - dim it
                board.classList.remove("active-board", "ring-4", "ring-yellow-400", "shadow-[0_0_20px_rgba(250,204,21,0.5)]");
                board.classList.add("opacity-40", "pointer-events-none");
                board.classList.remove("opacity-100");
            }
        });
    }

    private buildBoard(app: HTMLDivElement | HTMLElement) {
        app.innerHTML += `
        <div id="main-container" class="flex flex-col items-center min-h-screen p-4">
            <div id="game-info" class="pixel-box bg-gradient-to-r from-purple-600 to-blue-600 p-4 mb-6 max-w-md w-full text-center shadow-lg">
                <div id="current-move" class="text-xl md:text-2xl font-bold text-white">
                    <span id="current-move-icon" class="inline-block w-8 h-8 leading-8 bg-white text-blue-600 rounded mr-2">${this.currentMove}</span>
                    <span id="current-move-text" class="font-size-2">${this.currentMove}'s Turn</span>
                    <div class="text-sm flex justify-center" id="time">Time: 
                        <span id="minutes">00:</span>
                        <span id="seconds" class="p-0 m-0">00</span>
                    </div>
                </div>
            </div>
            <div id="tictactoe-board" class="grid grid-cols-3 gap-3 p-4 pixel-box bg-gray-800 w-full max-w-[min(90vw,60vh)] aspect-square shadow-2xl"></div>
        </div>`;
        
        const board = document.getElementById("tictactoe-board")!;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const large_board_cell = document.createElement("div");
                large_board_cell.className = "cell relative flex justify-center items-center p-2 bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-600";
                large_board_cell.dataset.lrow = i.toString();
                large_board_cell.dataset.lcol = j.toString();
                board.appendChild(large_board_cell);
                
                const small_board_container = document.createElement("div");
                small_board_container.className = "small-board grid grid-cols-3 gap-1 w-full h-full";
                large_board_cell.appendChild(small_board_container);
                small_board_container.dataset.lrow = i.toString();
                small_board_container.dataset.lcol = j.toString();
                
                for (let sr = 0; sr < 3; sr++) {
                    for (let sc = 0; sc < 3; sc++) {
                        const small_board = document.createElement("button");
                        small_board.className = "small-board-cell flex justify-center items-center aspect-square bg-gray-600 rounded hover:bg-blue-500 hover:scale-105 transition-all duration-200 text-white font-bold text-sm sm:text-base md:text-lg";
                        small_board.dataset.lrow = i.toString();
                        small_board.dataset.lcol = j.toString();
                        small_board.dataset.srow = sr.toString();
                        small_board.dataset.scol = sc.toString();
                        small_board_container.appendChild(small_board);
                    }
                }
            }
        }
    }


    private initializeBoard(status: string) {
        const small_board_cells = document.querySelectorAll(".small-board-cell") as NodeListOf<HTMLDivElement>;
        if (status === "disable") {
            small_board_cells.forEach((cell) => {
                cell.onclick = null;
            });
        } else if (status === "enable") {
            this.trueLargeBoard = this.createSmallBoard();
            const move = document.getElementById("current-move") as HTMLParagraphElement;
            const small_board_cells = document.querySelectorAll(".small-board-cell") as NodeListOf<HTMLDivElement>;
            small_board_cells.forEach((cell) => {
            cell.onclick = (event) => {
                const lrow = parseInt((event.currentTarget as HTMLDivElement).dataset.lrow!);
                const lcol = parseInt((event.currentTarget as HTMLDivElement).dataset.lcol!);
                const srow = parseInt((event.currentTarget as HTMLDivElement).dataset.srow!);
                const scol = parseInt((event.currentTarget as HTMLDivElement).dataset.scol!);
                this.makeMove(lrow, lcol, srow, scol, move, cell as HTMLDivElement);
            }});
        }
    }

    /*
        this function will create a new true large board and a new large board
        it will also reset the current move back to X
        it will then rebuild the frontend for the board by calling the buildBoard function
        after that, it will re-enable the cells to be clicked
     */
    private reset_state() {
        const app = document.getElementById("app") as HTMLDivElement | HTMLElement;
        const modal_container = document.getElementById("modal-container");
        const main_container = document.getElementById("main-container");
        main_container?.remove();
        modal_container?.remove();
        // clean up the true board
        this.trueLargeBoard = this.createSmallBoard();
        // clean up the large board
        this.largeBoard = this.createlargeBoard();
        this.lastMove = null;
        this.currentMove = "X";
        this.buildBoard(app);
        this.initializeBoard("enable");
        const move_container = document.getElementById("current-move-text");
        const text = move_container?.textContent;
        const newMoveText: string = `${text} (${this.p1Name})`;
        if (move_container) move_container.textContent = newMoveText;
        this.gameTime = 0;
    }

    private async updateHistory(winner: string) {
        try {
            const res = await fetch(`${backend_url}/users/${this.p1Name}/history`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify ({
                    game: "tictactoe",
                    local_op: this.p2Name,
                    op_id: this.router.login_info.id,
                    winner_id: winner === this.p1Name ? this.router.login_info.id : -1,
                    time: this.gameTime,
                    p1_score: 0,
                    p2_score: 0,
                }),
            });
            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
        return ;
    }

    private async winnerModal(winner: string) {
        await this.updateHistory(winner);
        const app = document.getElementById("app") as HTMLDivElement | HTMLElement;

        this.initializeBoard("disable");
        
        const main_screen = document.createElement("div");
        main_screen.id = "modal-container";
        main_screen.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
        app?.appendChild(main_screen);
        
        const background = document.createElement("div");
        background.id = "backscreen";
        background.className = "absolute inset-0 bg-black opacity-90";
        main_screen.appendChild(background);
        
        const modal = document.createElement("div");
        modal.id = "winner-modal";
        modal.className = "pixel-box relative z-10 bg-gradient-to-b from-purple-600 to-blue-700 p-8 max-w-md w-full mx-4 text-center animate-bounce-in";
        
        const trophy = document.createElement("div");
        trophy.className = "text-6xl mb-4 animate-bounce";
        trophy.innerText = "🏆";
        modal.appendChild(trophy);
        
        const text = document.createElement("h2");
        text.innerText = `${winner} WINS!`;
        text.className = "text-4xl font-bold mb-4 text-yellow-300 retro-shadow";
        modal.appendChild(text);
        
        const congrats = document.createElement("p");
        congrats.className = "text-xl text-white mb-6";
        congrats.innerText = "Congratulations!";
        modal.appendChild(congrats);
        
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex flex-col sm:flex-row gap-4 justify-center";
        
        const retry_button = document.createElement("button");
        retry_button.id = "retry-button";
        retry_button.className = "pixel-box clicky bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded text-lg transition-all";
        retry_button.innerText = "Play Again";
        buttonContainer.appendChild(retry_button);
        
        const menu_button = document.createElement("button");
        menu_button.className = "pixel-box clicky bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded text-lg transition-all";
        menu_button.innerText = "Main Menu";
        menu_button.onclick = () => {
            this.reset_state();
            this.router.route("/");
        };
        buttonContainer.appendChild(menu_button);
        
        modal.appendChild(buttonContainer);
        main_screen.appendChild(modal);

        retry_button.onclick = () => {
            this.reset_state();
        };
    }

    private makeMove(lrow: number, lcol: number, srow: number, scol: number, current_move: HTMLParagraphElement, cell: HTMLDivElement) {
    if (this.largeBoard[lrow][lcol][srow][scol] !== "") {
        return;
    }
    if (this.lastMove !== null) {
        const parentCell = cell.parentElement?.parentElement;
        if (parentCell !== this.lastMove) {
            return;
        }
    }
    
    this.largeBoard[lrow][lcol][srow][scol] = this.currentMove;
    
    const move = document.createElement("p");
    move.className = `text-2xl md:text-3xl p-0 m-0 font-bold ${this.currentMove === 'X' ? 'text-blue-400' : 'text-red-400'}`;
    move.innerText = this.currentMove;
    cell.appendChild(move);
    cell.classList.remove("hover:bg-blue-500", "hover:scale-105");
    cell.classList.add("cursor-not-allowed", "bg-gray-800");
    
    if (this.checkBoardWin(this.largeBoard[lrow][lcol])) {
        const largeCell = document.querySelector(`div.cell[data-lrow='${lrow}'][data-lcol='${lcol}']`) as HTMLDivElement;
        const winner = document.createElement("div");
        winner.className = `absolute inset-0 flex justify-center items-center bg-gradient-to-br ${this.currentMove === 'X' ? 'from-blue-500 to-blue-700' : 'from-red-500 to-red-700'} rounded-lg z-10`;
        
        const winnerText = document.createElement("p");
        winnerText.innerText = this.currentMove;
        winnerText.className = "text-6xl md:text-8xl font-bold text-white retro-shadow animate-pulse";
        winner.appendChild(winnerText);
        
        largeCell.appendChild(winner);
        largeCell.classList.remove("active-board", "ring-4", "ring-yellow-400", "shadow-[0_0_20px_rgba(250,204,21,0.5)]");
        this.trueLargeBoard[lrow][lcol] = this.currentMove;
    }
    
    if (this.checkBoardWin(this.trueLargeBoard)) this.winnerModal(this.currentMove);
    
    this.currentMove = this.currentMove === "X" ? "O" : "X";
    this.updateInfo(this.currentMove, (this.currentMove === "X" ? this.p1Name : this.p2Name)!);
    // const move_container = document.getElementById("current-move-text");
    // const text = move_container?.textContent;
    // const newMoveText: string = `${text} (${this.p2Name})`;
    // if (move_container) move_container.textContent = newMoveText;
    // current_move.innerHTML = `
    //     <span class="inline-block w-8 h-8 leading-8 bg-white ${this.currentMove === 'X' ? 'text-blue-600' : 'text-red-600'} rounded mr-2">${this.currentMove}</span>
    //     ${this.currentMove}'s (${this.currentMove === "X" ? this.p1Name : this.p2Name}) Turn
    // `;
    
    this.lockBoards(srow, scol, cell);
    }

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        this.largeBoard = this.createlargeBoard();
        this.buildBoard(app);
    }

    private updateTime() {
        this.gameTime += 1;
        console.log(this.gameTime);
        const time_display = document.getElementById("time") as HTMLSpanElement;
        const seconds = this.gameTime % 60;
        const minutes = Math.floor(this.gameTime / 60) % 60;
        const mins = document.getElementById("minutes");
        const secs = document.getElementById("seconds");
        mins!.textContent = minutes < 10 ? `0${minutes}` : `${minutes}`;
        mins!.textContent += ":";
        secs!.textContent = seconds < 10 ? `0${seconds}` : `${seconds}`;
    }

    async init() {
        this.navbar.init();
        // console.log("user info: ", this.router.login_info);
        this.p1Name = this.router.login_info.username;
        this.initializeBoard("enable");
        const app = document.getElementById("app") as HTMLDivElement;
        const params = new URLSearchParams();
        const isTournament = params.get("tournament");
        if (!(sessionStorage.getItem("tictactoe-tournament") === null && isTournament !== null && isTournament !== "true"))
        {
            // prompt for the second user's name
            const main_screen = document.createElement("div");
            main_screen.id = "modal-container";
            main_screen.className = "fixed z-50 flex inset-0 items-center justify-center p-4";
            app?.appendChild(main_screen);
            
            const background = document.createElement("div");
            background.id = "backscreen";
            background.className = "absolute inset-0 bg-black opacity-90";
            // main_screen.appendChild(background);
            
            const modal = document.createElement("div");
            modal.id = "p2Name-input";
            modal.className = "pixel-box relative z-10 bg-gradient-to-b from-purple-600 to-blue-700 p-8 max-w-md w-full mx-4 text-center animate-bounce-in";
            modal.textContent = "Please enter Player 2's name";

            const form = document.createElement("form");
            const input = document.createElement("input");
            const submit = document.createElement("button");
            submit.className = "pixel-box bg-green-500 px-8 py-2 text-white hover:bg-green-600 text-xl cursor-pointer";
            input.className = "w-[50%] px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323";
            input.maxLength = 15;
            submit.textContent = "OK!";

            submit.onclick = (e) => {
                e.preventDefault();
                const name = input.value;
                if (name == "")
                {
                    const invalid_elem = modal.querySelector("#invalid-name");
                    if (invalid_elem) modal.removeChild(invalid_elem);
                    const invalid = document.createElement("p");
                    invalid.textContent = "Please enter a valid name";
                    invalid.className = "text-red-500 text-xs h-4 text-center";
                    invalid.id = "invalid-name";
                    form.before(invalid);
                    return ;
                }
                sessionStorage.setItem("tictactoe-p2", name);
                this.p2Name = name;
                app?.removeChild(main_screen);
                const move_container = document.getElementById("current-move-text");
                const text = move_container?.textContent;
                const newMoveText: string = `${text} (${this.p1Name})`;
                if (move_container) move_container.textContent = newMoveText;
                // update time
                this.interval = setInterval(() => {this.updateTime()}, 1000);
            };
            
            form.appendChild(input);
            form.appendChild(submit);
            main_screen.appendChild(modal);
            modal.appendChild(form);
            app.appendChild(main_screen);
        }
    }
    
    unload() {
        clearInterval(this.interval!);
        this.reset_state();
    }
}