export default function sect_navbar() {
	return `<!-- nav bar -->
    <nav class="bg-blue-500 p-4 text-white">
        <div class="container mx-auto flex justify-between items-center">
            <a href="/"><h1 class="text-2xl font-bold popout">Pongy</h1></a>
			<div class="flex justify-right">
				<div id="google-login-button" class="g_id_signin pr-6" data-type="standard" data-client_id="336093315647-mlq5ufc06999l3vhrvbimtn36jqvmgtk.apps.googleusercontent.com"></div>
				<div id="profile-info" class="pr-6" style="display: none;">
					<div class="flex">
						<img id="pfp" class="pr-4" alt="Profile picture" width="64" height="64">
						<div>
							<h4 id="uname"></h4>
							<p class="text-sm" id="umail"></p>
						</div>
					</div>
				</div>
				<div class="flex space-x-4">
					<button id="logout-button" class="hover:text-blue-200 clicky" style="display: none;" onclick="logoutSession()">Logout</button>
					<button id="login-button" class="hover:text-blue-200 clicky">Login</button>
					<button id="signup-button" class="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 clicky">Sign Up</button>
				</div>
			</div>
        </div>
    </nav>`;
}