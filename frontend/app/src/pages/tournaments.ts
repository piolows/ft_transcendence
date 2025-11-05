import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class Tournament extends Component {
    private navbar = new NavBar(this.router);

    private tournamentItem(tournamentId: string, roomName: String, playerCount: Number, maxPlayers: Number) {
        const color = playerCount < maxPlayers ? "text-green-300" : "text-red-500";
        return `
        <div class="tournament-item grid grid-cols-2" data-tournament-id="${tournamentId}">
                <div class="crt-text flex flex-col">
                    <p class="inline text-[32px]">${roomName}</p>
                    <p class="player-count ${color} inline">${playerCount}/${maxPlayers} players</p>
                </div>
                <div class="join-button inline pixel-box bg-green-500 px-4 py-2 hover:bg-green-600 col-start-4 clicky w-60">
                    JOIN
                </div>
            </div> 
        `;
    }

    private async joinTournament(tournamentId: String) {
        console.log('joinTournament function was called');
        try {
            let result = await fetch(backend_url + "/tournaments/join", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tournamentId: tournamentId
                })
            });
        } catch (error) {
            console.error("Failed to join tournament:", error);
        }
        console.log('successfully joined tournament');
    }

    private async getTournamentData(): Promise<any> {
        let data = null;
        try {
            let info = await fetch(backend_url + "/tournaments/list", {
                method: "GET",
                credentials: "include"
            })
            data = await info.json();
        }
        catch (error) {
            console.error("Failed to fetch tournament info:", error);
        }
        return data;
    }

    async load (app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        const data = await this.getTournamentData();
        const tournaments = Object.values(data.tournaments);
        if (tournaments.length === 0) {
            app.innerHTML += `
            <div class="container mx-auto px-4">

                <div class="py-16 h-100" id="main-container">
                    <h2 class="text-4xl font-bold text-center mb-12 retro-shadow">Tournaments</h2>

                    <div class="pixel-box bg-opacity-80 bg-blue-900 p-8 grid gap-y-5" id="tournament-list">
                        <p class="text-center crt-text text-2xl">No tournaments available at the moment.</p>
                    </div>
                </div>
            </div>`;
            return;
        }
        let html = `
            <div class="container mx-auto px-4">

                <div class="py-16 h-100" id="main-container">
                <h2 class="text-4xl font-bold text-center mb-12 retro-shadow">Tournaments</h2>

            <div class="pixel-box bg-opacity-80 bg-blue-900 p-8 grid gap-y-5" id="tournament-list">
        `
        for (let i = 0, length = Object.keys(tournaments).length; i < length; i++) {
            const { uuid, roomName, players, maxPlayers } = tournaments[i] as any;
            const playerCount = Object.keys(players).length;
            html += this.tournamentItem(uuid, roomName, playerCount, maxPlayers);
        }
        app.innerHTML += html;
        document.querySelectorAll('.join-button',).forEach((button) => {
            button.addEventListener('click', async (event) => {
                const tournamentItem = (event.currentTarget as HTMLElement).closest('.tournament-item');
                if (tournamentItem) {
                    const id = tournamentItem.getAttribute('data-tournament-id');
                    if (id) {
                        await this.joinTournament(id);
                    }
                }
            });
        })
    }

    async init() {
        this.navbar.init();
    }

    unload() {
        
    }
}