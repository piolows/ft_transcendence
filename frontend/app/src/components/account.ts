export default function account(loggedin: boolean) {
	if (loggedin)
		return `<div class="flex justify-right">
					<div id="profile-info" class="pr-6">
						<div class="flex">
							<img id="pfp" class="pr-4" alt="Profile picture" width="64" height="64">
							<div>
								<h4 id="uname"></h4>
								<p class="text-sm" id="umail"></p>
							</div>
						</div>
					</div>
					<div class="flex space-x-4">
						<button id="logout-button" class="hover:text-blue-200 clicky">Logout</button>
					</div>
				</div>`;
	if (!loggedin)
		return `<div class="flex justify-right">
					<div id="google-login-button" class="g_id_signin pr-6" data-type="standard" data-client_id="336093315647-mlq5ufc06999l3vhrvbimtn36jqvmgtk.apps.googleusercontent.com"></div>
					<div class="flex space-x-4">
						<a href="/login"><button id="login-button" class="hover:text-blue-200 clicky">Login</button></a>
						<a href="/register"><button id="signup-button" class="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 clicky">Sign Up</button></a>
					</div>
				</div>`;
}