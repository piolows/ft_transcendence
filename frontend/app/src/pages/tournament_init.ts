import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { Tournament } from "./tournament";

export default class CreateTournament extends Component {
    private navbar = new NavBar(this.router);
    private players: Array<string> = [];

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        // make a main container
        const main_container = document.createElement("div");
        main_container.className = "container mx-auto w-[80%]";
        main_container.id = "main-container";
        const title_container = document.createElement("div");
        title_container.className = "pt-16";
        const title = document.createElement("h1");
        title.className = "text-4xl font-bold text-center mb-12 retro-shadow";
        title.innerText = "TOURNAMENT";
        title_container.appendChild(title);

        app.appendChild(title_container);
        app.appendChild(main_container);
        
        // add an input box in the main container to enter player names. add a button to either submit or add a bot instead
        const input_container = document.createElement("div");
        input_container.id = "input";
        input_container.className = "flex flex-col gap-8 py-4 justify-center items-center";
        input_container.innerText = "Enter participant names";
        const form = document.createElement("form");
        form.id = "participants";
        form.className = "grid grid-auto-rows items-center justify-items-center";
        for (let i = 0; i < 4; i++) {
            const row = document.createElement("div");
            row.className = "pairing p-0 m-0 flex gap-[30px]";
            const first = document.createElement("input");
            first.placeholder = "Mr. Smith";
            first.className = "player-name left-player w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base";
            row.appendChild(first);
            const second = document.createElement("input");
            second.placeholder = "Mr. Smith";
            second.className = "player-name right-player w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base";
            row.appendChild(second);
            form.appendChild(row);
        }
        input_container.appendChild(form);
        const submit_button = document.createElement("button");
        submit_button.id = "start-tournament";
        submit_button.innerText = "Start Tournament"
        // submit_button.className = "pixel-box clicky p-4 bg-green-500";
        submit_button.className = "pixel-box bg-green-500 px-8 py-4 text-white hover:bg-green-600 font-pixelify text-xl clicky";
        submit_button.type = "submit";
        input_container.appendChild(submit_button);
        main_container.appendChild(input_container);
    }
    async init() {
        await this.navbar.init();
        const start_tourney = document.getElementById("start-tournament") as HTMLButtonElement;
        start_tourney.onclick = (event) => {
            event.preventDefault();
            console.log("Starting tournament");
            // for every pairing, get each value in the input box
            const players = document.querySelectorAll(".player-name");
            for (const player of players) {
                if ((player as HTMLInputElement).value === "") this.players.push("bot");
                else this.players.push((player as HTMLInputElement).value);
            }
            if (localStorage.getItem("tournament") !== null) {
                console.log('deleting old tournament object');
                localStorage.removeItem("touranment");
            }
            const tournament = new Tournament(this.players as Array<string>);
            localStorage.setItem("tournament", JSON.stringify(tournament));
            this.router.route(`/tournament`);
        };
    }

    unload(){

    }
}