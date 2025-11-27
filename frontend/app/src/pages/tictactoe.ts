import Component from "../scripts/router";
import NavBar from "../components/nav_bar";

export default class TicTacToePage extends Component {
    private navbar = new NavBar(this.router);
    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        app.innerHTML += `
        <div id="main-container" class="pt-8">
            <div class="pixel-box">
                <p>O to move</p>
            </div>
            <div id="tictactoe-board" class="grid grid-cols-3 gap-2 mt-4 pixel-box p-4 border-2 w-64 h-64 mx-auto">

            </div>
        </div>`;
        // for each row, create 3 divs
        const board = document.getElementById("tictactoe-board")!;
        for (let i = 0; i < 3; i++) {
            // for each row, create 3 divs which represents each element
            for (let j = 0; j < 3; j++) {
                board.innerHTML += `
                <div class="cell flex justify-center items-center clicky border-2 border-black">
                </div>`;
            }
            // for each row, add another board
            for (let j = 0; j < 3; j++) {

            }
        }
    }

    async init() {

    }
}