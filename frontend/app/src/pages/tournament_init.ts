// import Component from "../scripts/router";
// import NavBar from "../components/nav_bar";

// export default class Tournament extends Component {
//     private navbar = new NavBar(this.router);
//     private players: Array<string[]> = [];

//     async load(app: HTMLDivElement | HTMLElement) {
//         await this.navbar.load(app);
//         // make a main container
//         const main_container = document.createElement("div");
//         main_container.className = "container mx-auto px-4 pixel-box h-full";
//         main_container.id = "main-container";
//         const title_container = document.createElement("div");
//         title_container.className = "pt-16";
//         const title = document.createElement("h1");
//         title.className = "text-4xl font-bold text-center mb-12 retro-shadow";
//         title.innerText = "TOURNAMENTS";
//         title_container.appendChild(title);

//         app.appendChild(title_container);
//         app.appendChild(main_container);
        
//         // add an input box in the main container to enter player names. add a button to either submit or add a bot instead
//         const input_container = document.createElement("div");
//         input_container.id = "input";
//         input_container.className = "flex flex-col justify-center items-center";
//         const form = document.createElement("form");
//         form.id = "participants";
//         form.className = "grid grid-auto-rows items-center justify-items-center";
//         for (let i = 0; i < 4; i++) {
//             const pairing_container = document.createElement("div");
//             pairing_container.className = "pairing p-0 m-0 flex gap-[30px]";
//             const left_player = document.createElement("input");
//             left_player.className = "player-name left-player w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base";
//             left_player.placeholder = "Mr Smith";
//             pairing_container.appendChild(left_player);
//             const vs = document.createElement("p");
//             vs.innerText = "VS";
//             pairing_container.appendChild(vs);
//             const right_player = document.createElement("input");
//             right_player.placeholder = "Mr Smith";
//             right_player.className = "player-name right-player w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base";
//             pairing_container.appendChild(right_player);
//             form.appendChild(pairing_container);
//         }
//         input_container.appendChild(form);
//         const submit_button = document.createElement("button");
//         submit_button.id = "start-tournament";
//         submit_button.innerText = "Start Tournament"
//         submit_button.className = "pixel-box clicky bg-green-500";
//         submit_button.type = "submit";
//         input_container.appendChild(submit_button);
//         main_container.appendChild(input_container);
//     }
//     async init() {
//         await this.navbar.init();
//         const start_tourney = document.getElementById("start-tournament") as HTMLButtonElement;
//         start_tourney.onclick = (event) => {
//             event.preventDefault();
//             console.log("Starting tournament");
//             // for every pairing, get each value in the input box
//             const pairings = document.querySelectorAll(".pairing") as NodeListOf<HTMLDivElement>;
//             for (const pairs of pairings){
//                 // add pairing to the list of pairings
//                 let pair:string[] = [];
//                 const left_player = (pairs.querySelector(".left-player") as HTMLInputElement).value;
//                 const right_player = (pairs.querySelector(".right-player") as HTMLInputElement).value;
//                 pair.push(left_player.length !== 0 ? left_player : "bot");
//                 pair.push(right_player.length !== 0 ? right_player : "bot");
//                 this.players.push(pair);
//             }
//         };
//     }

//     unload(){

//     }
// }

import Component from "../scripts/router";
import NavBar from "../components/nav_bar";

export default class CreateTournament extends Component {
    private navbar = new NavBar(this.router);
    private players: Array<string> = [];

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        // make a main container
        const main_container = document.createElement("div");
        main_container.className = "container mx-auto px-4 pixel-box h-full";
        main_container.id = "main-container";
        const title_container = document.createElement("div");
        title_container.className = "pt-16";
        const title = document.createElement("h1");
        title.className = "text-4xl font-bold text-center mb-12 retro-shadow";
        title.innerText = "TOURNAMENTS";
        title_container.appendChild(title);

        app.appendChild(title_container);
        app.appendChild(main_container);
        
        // add an input box in the main container to enter player names. add a button to either submit or add a bot instead
        const input_container = document.createElement("div");
        input_container.id = "input";
        input_container.className = "flex flex-col justify-center items-center";
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
        submit_button.className = "pixel-box clicky bg-green-500";
        submit_button.type = "submit";
        input_container.appendChild(submit_button);
        main_container.appendChild(input_container);
    }
    async init() {
        await this.navbar.init();
        const start_tourney = document.getElementById("start-tournament") as HTMLButtonElement;
        start_tourney.onclick = (event) => {
            event.preventDefault();
            console.log("Starting tournament");;
            // for every pairing, get each value in the input box
            const players = document.querySelectorAll(".player-name");
            for (const player of players) {
                if ((player as HTMLInputElement).value === "") {
                    this.players.push("bot");
                } else this.players.push((player as HTMLInputElement).value);
            }
            if (localStorage.getItem("ongoing") !== null && localStorage.getItem("ongoing") === "true") {
                console.log("removing players from localStorage");
                console.log("changing tournament ongoing status to false");
                localStorage.removeItem("players");
                localStorage.setItem("ongoing", "false");
            }
            localStorage.setItem("players", JSON.stringify(this.players));
            localStorage.setItem("ongoing", "true");
            this.router.route(`/tournaments?ongoing=true`);
        };
    }

    unload(){

    }
}