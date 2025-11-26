import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class CreateTournament extends Component {
    async load(app: HTMLDivElement | HTMLElement) {
        app.innerHTML += `
        <div id="main-container" class="fixed inset-0 z-50 flex items-center justify-center">
            <div id="backscreen" class="absolute inset-0 bg-black opacity-80"></div>
                <div class="relative pixel-box sm:w-[50dvh] md:w-[80dvh] bg-blue-900 p-8 w-96 text-white">
                    <h2 class="text-2xl font-pixelify mb-6 rainbow text-center">CREATE A TOURNAMENT</h2>
                        <form id="form" class="mx-auto flex flex-col justify-between gap-5">
                            <div>
                                <label for="room-name" class="block font-silkscreen mb-2">Room name</label><input autocomplete="off"
                                class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323" type="text" id="room-name" name="room-name" maxlength="20">
                            </div>
                            <div>
                                <label for="player-count" class="block font-silkscreen mb-2">Max players</label>
                                <input class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323" type="number" id="player-count" name="player-count" value="4" min="2" max="16">
                            </div>
                            <div>
                                <button id="create" class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky" type="submit">Create Tournament</button>
                            </div>
                        </form>
                        <button id="close-button" 
                            class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl clicky">
                            ×
                        </button>
                </div>
            </div>
        </div>
        `;
    };

    async init() {
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
        const close = document.getElementById("close-button") as HTMLButtonElement;
        close.onclick = () => {
			this.router.route(history.state?.route, "replace");
		};

		const bkscreen = document.getElementById("backscreen")!;
		bkscreen.onclick = () => {
			this.router.route(history.state?.route, "replace");
		};
    };
}