import Component, { backend_url } from "../scripts/router";

export default class SignUp extends Component {
	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML += 
		`<!-- register screen -->
		<div id="signup-screen" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black opacity-80"></div>
            <div class="relative pixel-box bg-green-900 p-8 w-96 text-white">
                <h2 class="text-2xl font-pixelify mb-6 rainbow text-center">SIGN UP</h2>
                <form id="registerForm" class="space-y-6">
                    <div>
                        <label class="block font-silkscreen mb-2">USERNAME</label>
                        <input name="username" type="text" 
                            class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323"
                            required>
                    </div>
                    <div>
                        <label class="block font-silkscreen mb-2">EMAIL</label>
                        <input name="email" type="email" 
                            class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323"
                            required>
                    </div>
                    <div>
                        <label class="block font-silkscreen mb-2">PASSWORD</label>
                        <input name="password" type="password" 
                            class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323"
                            required>
                    </div>
                    <div>
                        <label class="block font-silkscreen mb-2">AVATAR URL</label>
                        <input name="avatarURL" type="url" 
                            class="w-full px-4 py-2 bg-black border-2 border-green-500 text-white font-vt323">
                    </div>
                    <button type="submit" 
                        class="w-full bg-green-500 text-white py-3 pixel-box font-pixelify hover:bg-green-600 clicky">
                        CREATE ACCOUNT
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

	init() {
		const form = document.getElementById("registerForm") as HTMLFormElement;
	
		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const body = Object.fromEntries(formData.entries());
			try {
				const response = await fetch(`${backend_url}/auth/register`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body)
				});

				const data = await response.json();

				if (response.ok) {
					this.router.login_info = data.user;
					history.back();
				} else {
					alert(`Error: ${data.message}`);
				}
			} catch (error) {
				alert(`Error: ${error}`);
			}
		});

		const close = document.getElementById("close-button")! as HTMLButtonElement;
		close.style.cursor = "pointer";
		close.onclick = () => {
			history.back();
		};

		google.accounts.id.renderButton(
			document.getElementById("google-login-button")!,
			{ theme: "outline", size: "large" }
		);
	}
}