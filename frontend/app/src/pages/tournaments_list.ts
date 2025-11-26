import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class TournamentList extends Component {
    private navbar = new NavBar(this.router);
    private windowHeight = window.innerHeight;
    private windowWidth = window.innerWidth;
    private userInTournament: Boolean = false;
    private userTournament: string | null = null;
    private pageCount: number = 1;
    private itemCount: number = 0;
    private pages = [[]];
    private currentPage: number = 0;


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
                        <button id="leave-button" class="pixel-box bg-red-500 hover:bg-red-600 clicky h-[60px] sm:w-[80px] md:w-[100px] lg:w-[185px]">
                            <p>Leave</p>
                        </button>
                        <button id="room-button" class="pixel-box bg-green-500 hover:bg-green-600 clicky h-[60px] sm:w-[80px] md:w-[100px] lg:w-[185px]">
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
            <div class="container crt-text flex flex-col w-full">
                <p class="inline sm:text-[1em] md:text-[1.5em]">${roomName}</p>
                <p class="player-count ${color} inline">${playerCount}/${maxPlayers} players</p>
            </div>
            <div class="flex items-center">
                ${rightSide}
            </div>
        </div>`;
    }

    private async joinTournament(tournamentId: String) {
        console.log("join tournament was called");
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

    private async fillPages(tournaments: any, pages: any, currentPage: number) {
        let displayCount: number = tournaments.length;
        const tournamentContainer = document.getElementById('tournament-list');
        const containerBox = tournamentContainer?.getBoundingClientRect();
        if (!tournamentContainer) return;

        let lastItem = null;
        for (let i = 0; i < displayCount; i++) {
            const { uuid, roomName, players, maxPlayers, status } = tournaments[i] as any;
            for (const player in players) {
                if (players[player].username === this.router.login_info?.username) {
                    this.userInTournament = true;
                    this.userTournament = uuid;
                    break;
                }
            }
            // populate other pages with the same count 
            const playerCount = Object.keys(players).length;
            const allTournaments = document.querySelectorAll(".tournament-item");
            lastItem = allTournaments[allTournaments.length - 1];
            if (lastItem) {
                const rect = lastItem.getBoundingClientRect();
                // if the y position is greater than the container's height, dont display
                if (containerBox) {
                    if (rect.y > containerBox.height) {
                        let page = currentPage + 1;
                        pages[page] = [];
                        let k = 0;
                        for (let j = i; j < displayCount; j++) {
                            // for every page, add an item up until itemCount
                            // while (k < this.itemCount) {
                            if (k < this.itemCount) {
                                pages[page].push(this.tournamentItem(uuid, roomName, playerCount, maxPlayers, status));
                                k++;
                            }
                            if (k == this.itemCount) {
                                page++;
                                k = 0;
                                pages[page] = [];
                            }
                        }
                        this.pageCount = page;
                        break ;
                    }
                    
                }
            }
            if (!pages[currentPage]) {
                pages[currentPage] = [];
            }
            pages[currentPage].push(this.tournamentItem(uuid, roomName, playerCount, maxPlayers, status));
            this.itemCount += 1;
            tournamentContainer.innerHTML += this.tournamentItem(uuid, roomName, playerCount, maxPlayers, status);
        }
    }

    private async displayTournaments(page: number) {
        const tournamentContainer = document.getElementById('tournament-list');
        if (tournamentContainer?.innerHTML)
            tournamentContainer.innerHTML = "";
        if (tournamentContainer) {
            console.log(this.pages);
            if (!this.pages[page])
                console.log('there is no page');
            else {
                console.log('there is a page for page ', page);
                console.log('length: ', this.pages[page].length);
                for (let i = 0; i < this.pages[page].length; i++) {
                    tournamentContainer.innerHTML += this.pages[page][i];
                }
            }
        }
    }

    async load (app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        const data = await this.getTournamentData();
        const tournaments = Object.values(data.tournaments);
        let pages: any = [[]];
        let currentPage: number = 1;
        // add the tournament items to each page up until the tournament list boundary
        if (tournaments.length === 0) {
            app.innerHTML += `
            <div class="container mx-auto px-4">

                <div class="py-16 h-[400px]" id="main-container">
                    <h2 class="text-4xl font-bold text-center mb-12 retro-shadow">TOURNAMENTS</h2>

                    <div class="pixel-box h-[400px] bg-opacity-80 bg-blue-900 p-8 grid gap-y-5" id="tournament-list">
                        <p class="text-center crt-text text-2xl">No tournaments available at the moment.</p>
                    </div>
                </div>
            </div>`;
            return;
        }
        let html = `
            <div id="main-container" class="flex flex-col justify-center items-center container md:w[50%] mx-auto px-4">

                <h2 class="pt-16 sm:text-[30px] md:text-[50px] lg:text-4xl font-bold text-center mb-12 retro-shadow">TOURNAMENTS</h2>

                <div class="pixel-box h-[110dvh] md:w-[80dvw] bg-opacity-80 bg-blue-900 p-8 pb-0 grid content-start" id="tournament-list">
                </div>
            </div>
        `
        app.innerHTML += html;
        
        const container = document.getElementById("main-container") as HTMLDivElement;
        console.log(`container height ${container.getBoundingClientRect().height}, container y ${container.getBoundingClientRect().y}`);
        await this.fillPages(tournaments, this.pages, this.currentPage);
        console.log(this.pages);
        document.querySelectorAll('.join-button',).forEach((button) => {
            button.addEventListener('click', async (event) => {
                console.log('join button was clicked')
                const tournamentItem = (event.currentTarget as HTMLElement).closest('.tournament-item');
                if (tournamentItem) {
                    const id = tournamentItem.getAttribute('data-tournament-id');
                    if (id) {
                        await this.joinTournament(id);
                    }
                } else {
                    console.log('there is no tournament item');
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
        // this.displayTournaments(0);

        // to add the navigation buttons
        const main_container = document.getElementById("tournament-list") as HTMLDivElement;
        main_container.innerHTML += `<div class="mt-8 relative flex justify-center items-center space-x-8 font-pixelify">
                                <button id="prev" class="pixel-box bg-blue-700 px-6 py-3 hover:bg-blue-600 transition-colors clicky">
                                    ◄ PREV
                                </button>
                                <span class="text-xl font-vt323">Page ${currentPage} / ${this.pageCount}</span>
                                <button id="next" class="pixel-box bg-blue-700 px-6 py-3 hover:bg-blue-600 transition-colors clicky">
                                    NEXT ►
                                </button>
                            </div>`;
    }

    async init() {
        this.navbar.init();
        const prev = document.getElementById("prev") as HTMLButtonElement;
        const next = document.getElementById("next") as HTMLButtonElement;
        if (prev && next) {
            // if next button is pressed, display the next items 
            next.addEventListener('click', async (event) => {
                console.log('next was clicked');
                // re-render items from the pages
                this.currentPage += 1;
                if (this.currentPage > this.pageCount)
                    this.displayTournaments(this.currentPage);
            });
            prev.addEventListener('click', async (event) => {

            });
        }
    }
}