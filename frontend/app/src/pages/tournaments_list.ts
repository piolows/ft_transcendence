import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class TournamentList extends Component {
    private navbar = new NavBar(this.router);
    private windowHeight = window.innerHeight;
    private windowWidth = window.innerWidth;
    private userInTournament: Boolean = false;
    private tournamentId: string | null = null;

    private tournamentItem(tournamentId: string, roomName: String, playerCount: Number, maxPlayers: Number, tournamentStatus: String) {
        const color = playerCount < maxPlayers ? "text-green-300" : "text-red-500";
        let item = `
        <div class="tournament-item flex justify-between h-[120px]" data-tournament-id="${tournamentId}">
            <div class="crt-text flex flex-col">
                <p class="inline sm:text-[1em] md:text-[1.5em]">${roomName}</p>
                <p class="player-count ${color} inline">${playerCount}/${maxPlayers} players</p>
            </div>
        `;
        console.log(`tournamentStatus: ${tournamentStatus}`);
        if (tournamentStatus === "ongoing") {
            item += `<p class="sm:text-[1em] md:text-[1.5em]">Ongoing</p>`;
        } else if (tournamentStatus === "full") {
            item += `<p class="sm:text-[1em] md:text-[1.5em]">Full</p>`;
        } else if (this.userInTournament) {
            if (tournamentId === this.tournamentId) {
                item += `<button id="leave-button" class="flex items-center mx-auto justify-center pixel-box h-[60px] sm:w-sm md:w-[200px] lg:w-sm bg-red-500 px-4 py-2 hover:bg-red-600 clicky">Leave</button>`;
            } else {
                item += `<p class="sm:text-[1em] md:text-[1.5em]">Already in tournament</p>`;
            }
        } else {
            item += `
                 <button class="join-button flex items-center mx-auto justify-center pixel-box h-[60px] sm:w-sm md:w-[200px] lg:w-sm bg-green-500 px-4 py-2 hover:bg-green-600 clicky">
                     JOIN
                 </button>`
        }
        item += `</div>`;
        return item;
    }

    // needs a rework
    private getDisplayCount() {
        // based on size of container
        const tournamentContainer = document.getElementById('tournament-list');
        let count = 6;
        if (this.windowHeight < 700) {
            count = 3;
        } else if (this.windowHeight < 900) {
            count = 5;
        }
        return count;
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
        this.router.route(`/tournaments/id/${tournamentId}`);
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

    private async renderTournaments(tournaments: any) {
        // let displayCount = this.getDisplayCount();
        let displayCount = tournaments.length;
        const tournamentContainer = document.getElementById('tournament-list');
        if (!tournamentContainer) return;

        // tournamentContainer.innerHTML = '';

        for (let i = 0; i < displayCount; i++) {
            const { uuid, roomName, players, maxPlayers, status } = tournaments[i] as any;
            for (const player in players) {
                if (players[player].username === this.router.login_info?.username) {
                    this.userInTournament = true;
                    this.tournamentId = uuid;
                    break;
                }
            }
            const playerCount = Object.keys(players).length;
            tournamentContainer.innerHTML += this.tournamentItem(uuid, roomName, playerCount, maxPlayers, status);
        }
    }

    async load (app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        const data = await this.getTournamentData();
        const tournaments = Object.values(data.tournaments);
        console.log(`login info: ${Object.keys(this.router.login_info)}`);
        const navButtons = `<div class="mt-8 flex justify-center items-center space-x-8 font-pixelify">
                                <button class="pixel-box bg-blue-700 px-6 py-3 hover:bg-blue-600 transition-colors clicky">
                                    ◄ PREV
                                </button>
                                <span class="text-xl font-vt323">Page 1 / 5</span>
                                <button class="pixel-box bg-blue-700 px-6 py-3 hover:bg-blue-600 transition-colors clicky">
                                    NEXT ►
                                </button>
                            </div>`;
        if (tournaments.length === 0) {
            app.innerHTML += `
            <div class="container mx-auto px-4">

                <div class="py-16 h-[400px]" id="main-container">
                    <h2 class="text-4xl font-bold text-center mb-12 retro-shadow">Tournaments</h2>

                    <div class="pixel-box h-[400px] bg-opacity-80 bg-blue-900 p-8 grid gap-y-5" id="tournament-list">
                        <p class="text-center crt-text text-2xl">No tournaments available at the moment.</p>
                    </div>
                </div>
            </div>`;
            return;
        }
            // <div class="container sm:w-[2px] md:w-[3px] lg:w-[4px] mx-auto px-4">
        let html = `
            <div class="container md:w[50%] mx-auto px-4">

                <h2 class="pt-16 sm:text-3xl md:text-md lg:text-4xl font-bold text-center mb-12 retro-shadow">Tournaments</h2>

                <div class="pixel-box h-[60dvh] bg-opacity-80 bg-blue-900 p-8 grid overflow-hidden content-start" id="tournament-list">
                </div>
            </div>
        `
        app.innerHTML += html;
        await this.renderTournaments(tournaments);
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
}