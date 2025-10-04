import Webpage, { Router, backend_url } from "../scripts/router";

export default class SignUp implements Webpage {
	private router: Router;

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = 
			`<!-- sign up screen -->
			<div id="signup-screen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
				<div class="bg-white p-8 rounded-lg shadow-lg w-96">
					<h2 class="text-2xl font-bold mb-4 text-blue-500">Sign Up</h2>
					<form id="registerForm" class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700">Username</label>
							<input name="username" type="text" class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2" required>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Email</label>
							<input name="email" type="email" class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2" required>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Password</label>
							<input name="password" type="password" class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2" required>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Avatar URL (Optional)</label>
							<input name="avatarURL" type="url" class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2">
						</div>
						<button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Create Account</button>
					</form>
					<button class="mt-4 text-sm text-gray-500 hover:text-gray-700" id="close-button">Close</button>
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
					credentials: "include", // IMPORTANT for sending/receiving cookies!
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body)
				});

				const data = await response.json();

				if (response.ok) {
					this.router.route("/", true);
				} else {
					alert(`Error: ${data.message}`);
				}
			} catch (error) {
				alert(`Error: ${error}`);
			}
		});

		const close = document.getElementById("close-button") as HTMLButtonElement;

		close.onclick = () => {
			this.router.route("/", true);
		};
	}
}