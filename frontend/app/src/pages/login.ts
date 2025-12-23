import { getModeForUsageLocation } from "typescript";
import Component, { Router, backend_url } from "../scripts/router";

export default class Login extends Component {
	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML += 
		`<!-- login screen -->
        <div id="login-screen" class="fixed inset-0 z-50 flex items-center justify-center">
            <div id="backscreen" class="absolute inset-0 bg-black opacity-80"></div>
            <div class="relative pixel-box bg-blue-900 p-8 w-96 text-white">
                <h2 class="text-2xl font-pixelify mb-6 rainbow text-center">LOGIN</h2>
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block font-silkscreen mb-2">USERNAME</label>
                        <input id="username" name="username" type="text" 
                            class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
                            maxlength="20" required>
                    </div>
                    <div>
                        <label class="block font-silkscreen mb-2">PASSWORD</label>
                        <input name="password" type="password" 
                            class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
                            required>
						<p id="errmsg" class="text-red-500 text-xs h-4 pt-3 pb-3 text-center"></p>
                    </div>
                    <button type="submit"
                        class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky">
                        LOGIN
                    </button>
					<button class="w-full flex justify-center mx-auto">
						<div id="googleButton"
							class="bg-blue-500 text-white py-1.5 px-10 pixel-box font-pixelify hover:bg-blue-600 clicky"></div>
					</button>
                </form>
                <button id="close-button" 
                    class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl">
                    ×
                </button>
            </div>
        </div>`;
	}

	async init() {
		const form = document.getElementById("loginForm") as HTMLFormElement;
		document.getElementById("username")?.focus();
		const errtext = document.getElementById('errmsg')!;
		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const body = JSON.stringify(Object.fromEntries(formData.entries()));

			try {
				const response = await fetch(`${backend_url}/auth/login`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json", "Content-Length": body.length.toString() },
					body: body
				});

				const data = response.ok ? await response.json() : null;
				if (response.ok && data && data.success) {
					this.router.loggedin = true;
					this.router.login_info = data.user;
					this.router.start_presence_heartbeat();
					this.router.route(history.state?.route, "replace");
				} else {
					if (!data)
						errtext.textContent = "Error: Connection failure";
					else
						errtext.textContent = data.error;
				}
			} catch (error: any) {
				errtext.textContent = `Unexpected Error: ${error.statusText}`;
			}
		});

		const close = document.getElementById("close-button")! as HTMLButtonElement;
		close.style.cursor = "pointer";
		close.onclick = () => {
			this.router.route(history.state?.route, "replace");
		};

		const bkscreen = document.getElementById("backscreen")!;
		bkscreen.onclick = () => {
			this.router.route(history.state?.route, "replace");
		};

		(window as any).google.accounts.id.renderButton(
			document.getElementById("googleButton")!,
			{ 
				shape: "circle",
				size: "large",
				text: "continue_with",
				logo_alignment: "center",
			}
		);
	}
}