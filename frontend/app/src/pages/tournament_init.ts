import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { Tournament } from "./tournament";
import { faker } from '@faker-js/faker';
import Footer from "../components/footer";
import { Player, Bot } from "../scripts/game";
import { T } from "@faker-js/faker/dist/airline-DF6RqYmq";

export interface TournamentPlayer {
    name: string;
    isBot: boolean;
}

export default class CreateTournament extends Component {
    private navbar = new NavBar(this.router);
    private pairings: number = 4;
    private players: Array<TournamentPlayer> = [];
    private game: string | null = null;
    private footer = new Footer(this.router);

    async load(app: HTMLDivElement | HTMLElement) {

        await this.navbar.load(app);
        const parameters = new URLSearchParams(window.location.search);
        this.game = parameters.get("game");
        if (this.game && this.game === "tictactoe") this.pairings = 2;
        else this.pairings = 4;
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
        for (let i = 0; i < this.pairings; i++) {
            const row = document.createElement("div");
            row.className = "pairing p-0 m-0 flex gap-[30px]";
            const first = document.createElement("input");
            first.maxLength = 15;
            first.placeholder = "Mr. Smith";
            first.className = "player-name left-player w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base";
            if (this.game === "tictactoe") first.setAttribute("required", "");
            first.setAttribute
            row.appendChild(first);
            const second = document.createElement("input");
            second.maxLength = 15;
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
        submit_button.className = "pixel-box bg-green-500 px-8 py-4 text-white hover:bg-green-600 text-xl clicky";
        submit_button.type = "submit";
        input_container.appendChild(submit_button);
        main_container.appendChild(input_container);
        app.innerHTML += this.footer.get_html();
    }
    async init() {
        await this.navbar.init();
        const start_tourney = document.getElementById("start-tournament") as HTMLButtonElement;
        this.players = [];
        start_tourney.onclick = (event) => {
            event.preventDefault();
            // for every pairing, get each value in the input box
            const players = document.querySelectorAll(".player-name");
            const name_regex = /^[a-zA-Z0-9_-]+$/;
            for (const player of players) {
                if (!name_regex.test((player as HTMLInputElement).value))
                {
                    const main_container = document.getElementById("main-container") as HTMLDivElement;
                    if (main_container.querySelector("#warning") !== null) {
                        const to_remove = main_container.querySelector("#warning");
                        to_remove?.remove();
                    }
                    const warning = document.createElement("p");
                    warning.id = "warning";
                    warning.textContent = "No invalid symbols!";
                    warning.className = "text-red-500";
                    const submit_button = document.getElementById("start-tournament");
                    submit_button?.before(warning);
                    this.players = [];
                    return ;
                }
                if (this.players.map(p => p.name).find(name => name === (player as HTMLInputElement).value)) {
                    const main_container = document.getElementById("main-container") as HTMLDivElement;
                    if (main_container.querySelector("#warning") !== null) {
                        const to_remove = main_container.querySelector("#warning");
                        to_remove?.remove();
                    }
                    const warning = document.createElement("p");
                    warning.id = "warning";
                    warning.textContent = "No duplicate players allowed!";
                    warning.className = "text-red-500";
                    const submit_button = document.getElementById("start-tournament");
                    submit_button?.before(warning);
                    this.players = [];
                    return ;
                }
                if ((player as HTMLInputElement).value === "") {
                    if (this.game === "tictactoe") {
                        const main_container = document.getElementById("main-container") as HTMLDivElement;
                        if (main_container.querySelector("#warning") !== null) {
                            const to_remove = main_container.querySelector("#warning");
                            to_remove?.remove();
                        }
                        const warning = document.createElement("p");
                        warning.id = "warning";
                        warning.textContent = "Everyone must have a name!";
                        warning.className = "text-red-500";
                        const submit_button = document.getElementById("start-tournament");
                        submit_button?.before(warning);
                        this.players = [];
                        return ;
                    }
                    this.players.push({
                        name: faker.person.firstName() + "(bot)",
                        isBot: true
                    });
                }
                // else this.players.push((player as HTMLInputElement).value);
                else {
                    this.players.push({
                        name: (player as HTMLInputElement).value,
                        isBot: false
                    });
                }
            }
            if (this.game === "tictactoe") {
                if (sessionStorage.getItem("tictactoe-tournament") !== null)
                    sessionStorage.removeItem("tictactoe-tournament");
            } else {
                if (sessionStorage.getItem("tournament") !== null)
                    sessionStorage.removeItem("touranment");
            }
            const tournament = new Tournament(this.players);
            sessionStorage.setItem(this.game === "tictactoe" ? "tictactoe-tournament" : "tournament", JSON.stringify(tournament));
            this.router.route(`/tournament?game=${this.game}`);
        };
    }

    unload(){

    }
}