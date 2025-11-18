import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class CreateTournament extends Component {

    async load(app: HTMLDivElement | HTMLElement) {
        await new NavBar(this.router).load(app);
        const mainContent = `
        <h2 class="pt-16 sm:text-3xl md:text-md lg:text-4xl font-bold text-center mb-12 retro-shadow">Create a Tournament</h2>
        <div id="main-container" class="container pixel-box mx-auto bg-blue-900 p-8">
            <form id="form" class="mx-auto flex flex-col justify-between gap-3">
                <div>
                    <label for="room-name" class="text-[30px]">Room name: </label><input class="text-black" type="text" id="room-name" name="room-name" maxlength="20">
                </div>
                <div>
                    <label for="player-count" class="text-[30px]">Max players: </label><input type="number" id="player-count" name="player-count" value="4" min="2" max="16">
                </div>
                <div>
                    <button id="create" class="pixel-box bg-green-500 h-[60px] clicky" type="submit">Create Tournament</button>
                </div>
            </div>
        </form>
        `;

        app.innerHTML += mainContent;
        const form = document.getElementById("form") as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const roomName = (document.getElementById("room-name") as HTMLInputElement).value;
            const playerCount = parseInt((document.getElementById("player-count") as HTMLInputElement).value, 10);

            try {
                const response = await fetch(`${backend_url}/tournaments/create`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        roomName: roomName,
                        maxPlayers: playerCount,
                    }),
                });
                const data = response.ok ? await response.json() : null;
                if (response.ok && data && data.success) {
                    const tournament_id = data.tournamentId;
                    this.router.route(`/tournaments/id/${tournament_id}`); // route to the tournament room after creation
                } else {
                    alert(`Error creating tournament: ${data.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error while creating tournament:', error);
            }
        });
    };

    async init() {

    };
}