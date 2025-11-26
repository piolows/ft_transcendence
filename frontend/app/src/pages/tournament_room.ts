import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";
import { createModuleResolutionCache } from "typescript";
import { data } from "autoprefixer";

export default class TournamentRoom extends Component {
    private navbar = new NavBar(this.router);
    private playerCount: number = 0;
    private players: Array<string> = [];

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        const tournament = await this.get_info();

        app.innerHTML += `
        <h2 class="pt-16 sm:text-3xl md:text-md lg:text-4xl font-bold text-center mb-12 retro-shadow">${tournament.roomName}</h2>
        <div id="main-container" class="container pixel-box mx-auto bg-blue-900 p-8  md:w-[80dvw]">
        </div>
        `
    }

    async get_info() {
        const id = this.real_path.split("/").pop();
        // get the tournament info from the backend
        try {
            const tournament = await fetch(`${backend_url}/tournaments/${id}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await tournament.json();
            if (!data.success) {
                await this.router.route_error(this.real_path, data.code, data.error);
                return ;
            }
            return data.tournament;
        } catch (error) {
            await this.router.route_error(this.real_path, 500, "Internal Server Error");
        }
    }

    private inputContainer() {
        return `
        <div class="input-container py-4">
                <input id="player-2" class="player px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323">
                <button class="lock-player clicky bg-green-500 pixel-box h-[45px] w-[120px]">LOCK</button>
        </div>`;
    }

    private nameBox() {
        return `
        <div class="flex flex-row justify-around items-center">
            ${this.inputContainer()}
        </div>`
    }

    async init() {
        const tournament = await this.get_info();
        const players = Object.keys(tournament.players);
        this.playerCount = tournament.maxPlayers;
        const main_container = document.getElementById("main-container") as HTMLDivElement;
        for (let i = 0; i < tournament.maxPlayers; i++) {
            // prompt an input box with the user's name
            // get the amount of players in the tournament and then
            if (this.players[i] !== undefined) {
                main_container.innerHTML += `<p>${this.players[i]}</p>`;
            } else {
                main_container.innerHTML += this.nameBox();
            }
        }
        const lockBtns = document.querySelectorAll(".lock-player");
        let joined: Boolean = false;
        lockBtns.forEach((e) => {
            e.addEventListener('click', async (event) => {
                const parentContainer = e.closest(".input-container") as HTMLDivElement;
                const playerName = (e.previousElementSibling as HTMLInputElement).value;
                try {
                    const response = await fetch(`${backend_url}/tournaments/join`, {
                        method: "POST",
                        headers: {"Content-type": "application/json"},
                        body: JSON.stringify({username: playerName, isLocal: true, tournamentId: tournament.uuid}),
                    });
                    const data = await response.json();
                    console.log(data);
                    if (!data.success) {
                        alert(`Failed to join tournament: ${data.error}`);
                    } else {
                        joined = true;
                    }
                } catch (error) {
                    alert(`Fetch call failed`);
                }
                if (joined) {
                    parentContainer.innerHTML = `<p>${playerName}</p>`
                    this.playerCount--;
                }
                if (this.playerCount === 0) {
                    // send a post to the backend to add players
                    main_container.innerHTML += `
                    <div class="flex w-full justify-center pt-5">
                        <button id="start" class="w-50 bg-green-500 text-white py-3 pixel-box font-pixelify hover:bg-green-600 clicky">START</button>
                    </div>`;
                    const start = document.getElementById("start") as HTMLButtonElement;
                    start.addEventListener("click", async () => {
                        // reroute to pong game
                        // call start tournament endpoint
                        // once it starts, reroute to the first match
                        try {
                            const response = await fetch(`${backend_url}/tournaments/start`, {
                                method: "POST",
                                headers: {"Content-type": "application/json"},
                                credentials: "include",
                                body: JSON.stringify({tournamentId: tournament.uuid, isLocal: true}),
                            })
                            const data = await response.json();
                            if (!data.success) {
                                alert(`Failed to start tournament: ${data.error}`);
                                return ;
                            }
                        } catch (error) {
                            alert(`Failed to start tournament`);
                            return ;
                        }
                        this.router.route(`/pong/game?op=player&tournamentId=${tournament.uuid}`);
                    });
                }
            });
        })
    }
}