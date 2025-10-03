import Webpage from "../scripts/router";

export default class SignUp implements Webpage {
	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = 
			`<!-- sign up screen -->
			<div id="signup-screen" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
					<button class="mt-4 text-sm text-gray-500 hover:text-gray-700" id="signup-close-button">Close</button>
				</div>
			</div>`;
	}
}