import Component, { Router, backend_url } from "../scripts/router";

export default class AuthSection extends Component {
	constructor(router: Router) {
		super(router);
	}

	logged_in_block() {
		return `
			<div class="flex items-center space-x-6">
				<div id="profile-info">
					<div class="flex items-center space-x-4">
						<img id="pfp" src="${ backend_url + this.router.login_info.avatarURL }" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
						<div>
							<h4 id="username" class="crt-text">${ this.router.login_info.username }</h4>
							<p id="email" class="text-xs font-silkscreen">${ this.router.login_info.email }</p>
						</div>
					</div>
				</div>
				<div class="flex space-x-4">
					<button id="logout-button" class="hidden hover:text-blue-200 clicky wiggler">
						LOGOUT
					</button>
				</div>
			</div>`;
	}

	logged_out_block() {
		return `
			<div class="flex items-center space-x-6">
				<div class="flex space-x-4">
					<a href="/login" router-link>
						<button id="login-button" class="pixel-box bg-blue-600 px-6 py-2 hover:bg-blue-700 clicky">
							LOGIN
						</button>
					</a>
					<a href="/register" router-link>
						<button id="signup-button" class="pixel-box bg-green-500 px-6 py-2 hover:bg-green-600 clicky">
							SIGN UP
						</button>
					</a>
				</div>
			</div>`;
	}

	get_html() {
		if (this.router.loggedin)
			return this.logged_in_block();
		else
			return this.logged_out_block();
	}

	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}

	init() {
		if (this.router.loggedin) {
			const logoutbtn = document.getElementById('logout-button')! as HTMLButtonElement;
			logoutbtn.onclick = async () => {
				try {
					await fetch(backend_url + "/auth/logout", {
						method: "POST",
						body: JSON.stringify({}),
						credentials: "include"
					});
					this.router.login_info = null;
					logoutbtn.parentElement?.parentElement && (logoutbtn.parentElement.parentElement.innerHTML = this.logged_out_block());
				} catch (err) {
					console.error("Failed to log out:", err);
				}
			}
		}
	}
}



  