import Component, { sockets_url } from "../scripts/router";

export default class PongJoin extends Component {
	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML += 
		`<!-- join screen -->
        <div id="join-screen" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black opacity-80"></div>
            <div class="relative pixel-box bg-blue-900 p-8 w-96 text-white">
                <h2 class="text-2xl font-pixelify mb-6 rainbow text-center">JOIN GAME</h2>
                <form id="joinForm" class="space-y-6">
					<input name="action" value="JOIN" hidden />
                    <div>
                        <label class="block font-silkscreen mb-2">ROOM CODE</label>
                        <input name="game_id" type="text" 
                            class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
                            required>
                    </div>
                    <div>
                        <label class="block font-silkscreen mb-2">JOIN AS</label>
                        <select name="param" class="cool-select">
							<option value="PLAY">PLAYER</option>
							<option value="SPEC" selected>SPECTATOR</option>
							<option value="EITHER">EITHER</option>
						</select>
                    </div>
                    <button type="submit"
                        class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky">
                        JOIN
                    </button>
                </form>
                <button id="close-button" 
                    class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl">
                    ×
                </button>
            </div>
        </div>`;
	}

	init() {
		const form = document.getElementById("joinForm")! as HTMLFormElement;

		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const body = Object.fromEntries(formData.entries());

			const game_id_regex = /^[a-zA-Z0-9]{16}$/;
			const game_id = formData.get('game_id')?.toString()!;
			if (!game_id_regex.test(game_id)) {
				alert(`Error: Invalid room code`);
				return ;
			}
			try {
				const response = await fetch(`${sockets_url}/pong/room/${game_id}`, {
					method: "POST",
					credentials: "include",
				});

				const data = response.ok ? await response.json() : null;

				if (response.ok && data && data.success) {
					this.router.route(`/pong/room/${game_id}`);
				} else {
					alert(`Error: ${data.message}`);
				}
			} catch (error) {
				console.error("Fetch error:", error);
			}
		});

		const close = document.getElementById("close-button")! as HTMLButtonElement;
		close.style.cursor = "pointer";
		close.onclick = () => {
			history.back();
		};
	}
}