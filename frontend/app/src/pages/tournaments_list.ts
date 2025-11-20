import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class TournamentList extends Component {
    private navbar = new NavBar(this.router);
    private windowHeight = window.innerHeight;
    private windowWidth = window.innerWidth;
    private userInTournament: Boolean = false;
    private userTournament: string | null = null;

    private tournamentItem(tournamentId: string, roomName: String, playerCount: Number, maxPlayers: Number, tournamentStatus: String) {
        const color = playerCount < maxPlayers ? "text-green-300" : "text-red-500";
        let rightSide = "";

        if (tournamentStatus === "ongoing") {
            rightSide = `<p class="sm:text-[1em] md:text-[1.5em]">Ongoing</p>`;
        } else if (tournamentStatus === "full") {
            rightSide = `<p class="sm:text-[1em] md:text-[1.5em]">Full</p>`;
        } else if (this.userInTournament) {
            if (tournamentId === this.userTournament) {
                rightSide = `
                    <div class="flex gap-2">
                        <button id="leave-button" class="pixel-box bg-red-500 hover:bg-red-600 clicky h-[60px] sm:w-[120px] md:w-[200px] lg:w-sm">
                            <p>Leave</p>
                        </button>
                        <button id="room-button" class="pixel-box bg-green-500 hover:bg-green-600 clicky h-[60px] sm:w-[120px] md:w-[200px] lg:w-sm">
                            <p>View</p>
                        </button>
                    </div>`;
            } else {
                rightSide = `<p class="sm:text-[1em] md:text-[1.5em]">Already in tournament</p>`;
            }
        } else {
            rightSide = `
                <button class="join-button pixel-box bg-green-500 hover:bg-green-600 clicky h-[60px] sm:w-sm md:w-[200px] lg:w-sm flex items-center justify-center">
                    JOIN
                </button>`;
        }

        return `
        <div class="tournament-item flex justify-between items-start h-[120px]" data-tournament-id="${tournamentId}">
            <div class="crt-text flex flex-col">
                <p class="inline sm:text-[1em] md:text-[1.5em]">${roomName}</p>
                <p class="player-count ${color} inline">${playerCount}/${maxPlayers} players</p>
            </div>
            <div class="flex items-center">
                ${rightSide}
            </div>
        </div>`;
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
        let displayCount = tournaments.length;
        const tournamentContainer = document.getElementById('tournament-list');
        if (!tournamentContainer) return;


        for (let i = 0; i < displayCount; i++) {
            const { uuid, roomName, players, maxPlayers, status } = tournaments[i] as any;
            for (const player in players) {
                if (players[player].username === this.router.login_info?.username) {
                    this.userInTournament = true;
                    this.userTournament = uuid;
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
        });
        document.querySelector('#leave-button')?.addEventListener('click', async (event) => {
            // send a fetch request with the tournament id as the body to leave the tournament
            const tournamentItem = (event.currentTarget as HTMLElement).closest('.tournament-item');
            let id = null;
            if (tournamentItem) {
                id = tournamentItem.getAttribute('data-tournament-id');
            }
            const response = await fetch(`${backend_url}/tournaments/leave`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    tournamentId: this.userTournament
                })
            });
            const data = await response.json();
            if (!data.success) {
                console.error('Failed to leave tournament:', data.message);
                return;
            }
            window.location.reload();
        });
        document.querySelector('#room-button')?.addEventListener('click', async () => {
            if (this.userTournament) {
                this.router.route(`/tournaments/id/${this.userTournament}`);
            }
        });
    }

    async init() {
        this.navbar.init();
    }
}