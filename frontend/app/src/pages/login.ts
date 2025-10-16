import Component, { Router, backend_url } from "../scripts/router";

export default class Login extends Component {
	load(app: HTMLDivElement | HTMLElement) {
		if (history.length == 0)
			this.router.route("/", true);
		app.innerHTML += 
		`<!-- login screen -->
        <div id="login-screen" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black opacity-80"></div>
            <div class="relative pixel-box bg-blue-900 p-8 w-96 text-white">
                <h2 class="text-2xl font-pixelify mb-6 rainbow text-center">LOGIN</h2>
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block font-silkscreen mb-2">USERNAME</label>
                        <input name="username" type="text" 
                            class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
                            required>
                    </div>
                    <div>
                        <label class="block font-silkscreen mb-2">PASSWORD</label>
                        <input name="password" type="password" 
                            class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
                            required>
                    </div>
                    <button type="submit" 
                        class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky">
                        LOGIN
                    </button>
                </form>
				<div id="google-login-button" class="g_id_signin pr-6" data-type="standard" data-client_id="336093315647-mlq5ufc06999l3vhrvbimtn36jqvmgtk.apps.googleusercontent.com"></div>
                <button id="close-button" 
                    class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl">
                    ×
                </button>
            </div>
        </div>`;
	}

	// 	if (!this.router.is_logged_in()) {
	// 		google.accounts.id.renderButton(
	// 			document.getElementById("google-login-button")!,
	// 			{ theme: "outline", size: "large" }
	// 		);
	// 	}
	init() {
		const form = document.getElementById("loginForm") as HTMLFormElement;
	
		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const body = Object.fromEntries(formData.entries());

			try {
				const response = await fetch(`${backend_url}/auth/login`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body)
				});

				const data = await response.json();

				if (response.ok) {
					this.router.login_info = data.user;
					this.router.route("/", true);
				} else {
					alert(`Error: ${data.message}`);
				}
			} catch (error) {
				document.getElementById("message")!.textContent = "❌ Network error";
				console.error("Fetch error:", error);
			}
		});

		const close = document.getElementById("close-button")! as HTMLButtonElement;
		close.style.cursor = "pointer";
		close.onclick = () => {
			if (history.length > 0) {
				history.back();
			} else {
				this.router.route('/', true);
			}
		};
	}
}