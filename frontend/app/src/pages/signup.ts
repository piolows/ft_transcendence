import Component, { backend_url } from "../scripts/router";

export default class SignUp extends Component {
	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML += 
		`<!-- register screen -->
		<div id="signup-screen" class="fixed inset-0 z-50 flex items-center justify-center">
            <div id="backscreen" class="absolute inset-0 bg-black opacity-80"></div>
            <div class="relative pixel-box bg-green-900 p-8 w-auto max-w-4xl text-white">
                <h2 class="text-2xl font-pixelify mb-6 rainbow text-center">SIGN UP</h2>
                <form id="registerForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- left column -->
                        <div class="space-y-6">
                            <div>
                                <label class="block font-silkscreen mb-2">USERNAME</label>
                                <input name="username" type="text" 
                                    class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base"
                                    maxlength="15" required>
                            </div>
                            <div>
                                <label class="block font-silkscreen mb-2">EMAIL</label>
                                <input name="email" type="email" 
                                    class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base"
                                    required>
                            </div>
                            <div>
                                <label class="block font-silkscreen mb-2">PASSWORD</label>
                                <input name="password" type="password" 
                                    class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base"
                                    required>
                            </div>
                        </div>
                        
                        <!-- right column -->
                        <div class="space-y-6">
                            <div>
                                <label class="block font-silkscreen mb-2">AVATAR URL</label>
                                <input name="avatarURL" type="url" 
                                    class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base"
                                    placeholder="https://example.com/image.jpg">
                            </div>
                            <div class="text-center font-silkscreen text-sm text-gray-300">OR</div>
                            <div>
                                <label class="block font-silkscreen mb-2">UPLOAD FILE</label>
                                <input name="avatarFile" type="file" accept="image/*"
                                    class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323 text-base">
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" 
                        class="w-full bg-green-500 text-white py-3 pixel-box font-pixelify hover:bg-green-600 clicky">
                        CREATE ACCOUNT
                    </button>
					<button type="button" class="w-full flex justify-center mx-auto">
						<div id="googleButton"
							class="bg-green-500 text-white py-1.5 px-10 pixel-box font-pixelify hover:bg-green-600 clicky"></div>
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
		const form = document.getElementById("registerForm") as HTMLFormElement;

		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const body = JSON.stringify(Object.fromEntries(formData.entries()));
			try {
				const response = await fetch(`${backend_url}/auth/register`, {
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
						console.error("Fetch error");
					else
						console.error(`Error ${data.code}: ${data.error}`);
				}
			} catch (error: any) {
				console.error("Fetch error:", error.status, error.message);
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