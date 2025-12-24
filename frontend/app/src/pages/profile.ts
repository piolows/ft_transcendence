import Component, { backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import { formatDiagnosticsWithColorAndContext } from "typescript";

export default class Profile extends Component {
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);
	private profile_info: any;
	private online: any;
	private last_seen: any;
	private last_matches: any;
	private friend_count: any;
	private game_count: any;
	private user_stats: any;
	private is_friends: any;

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		if (!this.profile_info)
			return ;
		await this.navbar.load(app);
		app.innerHTML += `
			<main class="container mx-auto px-4 py-8 pr-8">
				<!-- profile header -->
				<div class="flex items-center justify-center mb-12">
					<div class="pixel-box bg-blue-900 p-8 w-auto">
						<div class="flex flex-col md:flex-row justify-between">
							<div class="flex items-center space-x-8">
								<div class="relative ${this.profile_info.id == this.router.login_info.id ? 'group cursor-pointer' : ''}" id="avatar-container">
									<img src="${backend_url + this.profile_info.avatarURL}" 
										class="w-32 h-32 rounded-full pixel-box" alt="Profile Picture">
								${this.profile_info.id == this.router.login_info.id ? `
								<div class="absolute inset-0 bg-black/0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/30 transition-opacity">
									<span class="text-5xl">✎</span>
								</div>` : ''}
								</div>
								<div class="pr-16">
									<a id="edit-username-btn" class="flex items-center space-x-2 mb-2">
										<h1 class="text-3xl font-bold rainbow">${this.profile_info.username}</h1>
										${this.profile_info.id == this.router.login_info.id ? `
										<button class="text-gray-400 hover:text-white transition-colors text-xl" style="cursor: pointer;">
											✎
										</button>` : `<div class="rounded-full ml-2 ${this.online ? `bg-green-500` : `bg-gray-400`} w-3 h-3"></div>`}
									</a>
									<p class="text-gray-400 font-silkscreen">${this.profile_info.email}</p>
									${this.online ? '' : `<p class="text-gray-400 font-silkscreen">Last seen: ${this.last_seen}</p>`}
									${this.profile_info.id == this.router.login_info.id ? `
									<button id="change-password-btn" class="mt-3 pixel-box bg-red-600 px-4 py-2 text-sm hover:bg-red-700 transition-colors clicky font-pixelify glitch">
										CHANGE PASSWORD
									</button>` : ''}
								</div>
							</div>
							<div ${
								this.profile_info.id != this.router.login_info.id ?
								`class="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2"` :
								``
							}>
								<a href="/friends/${this.profile_info.username}" router-link ${
									this.profile_info.id != this.router.login_info.id ?
									`class="hover:opacity-80 transition-opacity flex flex-row lg:flex-col justify-between lg:items-center lg:justify-center w-full mx-auto pt-8 md:pt-0 pr-4 md:pr-0"` :
									`class="hover:opacity-80 transition-opacity flex flex-row justify-between mt-8 md:mt-0 md:flex-col h-full items-center md:justify-center "`
								}>
									<div><h1 class="pb-5 retro-shadow">Friends</h1></div>
									<div><p>${ this.friend_count }</p></div>
								</a>
								<div id="follow_area" class="mx-auto my-auto" style="float: right;">
									
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- stats -->
				<div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12 text-center lg:text-left w-full">
					<!-- Game Statistics -->
					<div class="pixel-box bg-blue-900 p-6" style="height: 306px; max-height: 306px;">
						<h2 class="text-2xl font-bold retro-shadow mb-6">Game Statistics</h2>
						<div class="flex flex-col justify-between h-40 pt-6">
							<div class="flex justify-between items-center">
								<span class="font-silkscreen">Total Games</span>
								<span id="total-games" class="crt-text">0</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="font-silkscreen">Wins</span>
								<span id="wins" class="crt-text text-green-400">0</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="font-silkscreen">Losses</span>
								<span id="losses" class="crt-text text-red-400">0</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="font-silkscreen">Win Rate</span>
								<span id="win-rate" class="crt-text text-yellow-400">0%</span>
							</div>
						</div>
					</div>

					<!-- recent activity -->
					<div class="pixel-box bg-blue-900 p-6" style="height: 306px; max-height: 306px;">
						<h2 class="text-2xl font-bold retro-shadow mb-6">Recent Activity</h2>
						<div id="recent-games" class="space-y-4 h-32 sm:h-40 font-silkscreen text-base" style="max-height: 160px;">
							<div class="text-center text-gray-400">
								No recent games
							</div>
						</div>
						<div class="mt-6 w-full text-center" style="font-size: 14px;">
							<a href="/history/${this.profile_info.username}" router-link class="hover:opacity-80 transition-opacity">
								View Match History
							</a>
						</div>
					</div>
				</div>
			</main>

			<!-- username modal -->
			<div id="edit-username-modal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
				<div class="absolute inset-0 bg-black opacity-80 faded_bg"></div>
				<div class="relative pixel-box bg-blue-900 p-8 w-96 text-white">
					<h2 class="text-2xl font-pixelify mb-6 rainbow text-center">EDIT USERNAME</h2>
					<form id="edit-username-form" class="space-y-6">
						<input name="email" value="${this.router.login_info.email}" hidden />
						<div>
							<label class="block font-silkscreen mb-2">NEW USERNAME</label>
							<input name="username" type="text" 
								class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
								placeholder="${this.profile_info.username}"
								required>
						</div>
						<p id="username-errmsg" class="text-red-500 text-xs pb-3 text-center"></p>
						<button type="submit" 
							class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky">
							UPDATE USERNAME
						</button>
					</form>
					<button id="close-username-modal" 
						class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl">
						×
					</button>
				</div>
			</div>

			<!-- pfp modal -->
			<div id="edit-avatar-modal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
				<div class="absolute inset-0 bg-black opacity-80 faded_bg"></div>
				<div class="relative pixel-box bg-blue-900 p-8 w-96 text-white">
					<h2 class="text-2xl font-pixelify mb-6 rainbow text-center">CHANGE PROFILE PICTURE</h2>
					<form id="edit-avatar-form" class="space-y-6">
						<input name="email" value="${this.router.login_info.email}" hidden />
						<div>
							<label class="block font-silkscreen mb-2">IMAGE URL</label>
							<input name="avatarURL" type="url" 
								class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
								placeholder="https://example.com/image.jpg">
						</div>
						<div class="text-center font-silkscreen text-sm text-gray-300">OR</div>
						<div>
							<label class="block font-silkscreen mb-2">UPLOAD FILE</label>
							<input name="avatarFile" type="file" accept="image/*"
								class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323">
						</div>
						<p id="avatar-errmsg" class="text-red-500 text-xs pb-3 text-center"></p>
						<button type="submit" 
							class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky">
							UPDATE PICTURE
						</button>
					</form>
					<button id="close-avatar-modal" 
						class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl">
						×
					</button>
				</div>
			</div>

			<!-- password modal -->
			<div id="change-password-modal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
				<div class="absolute inset-0 bg-black opacity-80 faded_bg"></div>
				<div class="relative pixel-box bg-blue-900 p-8 w-96 text-white">
					<h2 class="text-2xl font-pixelify mb-6 rainbow text-center">CHANGE PASSWORD</h2>
					<form id="change-password-form" class="space-y-6">
						<input name="email" value="${this.router.login_info.email}" hidden />
						<div>
							<label class="block font-silkscreen mb-2">CURRENT PASSWORD</label>
							<input name="password" type="password" 
								class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
								required>
						</div>
						<div>
							<label class="block font-silkscreen mb-2">NEW PASSWORD</label>
							<input name="newpassword" type="password" 
								class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
								required>
						</div>
						<div>
							<label class="block font-silkscreen mb-2">CONFIRM NEW PASSWORD</label>
							<input name="confirmPassword" type="password" 
								class="w-full px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323"
								required>
						</div>
						<p id="password-errmsg" class="text-red-500 text-xs pb-3 text-center"></p>
						<button type="submit" 
							class="w-full bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky">
							UPDATE PASSWORD
						</button>
					</form>
					<button id="close-password-modal" 
						class="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-xl">
						×
					</button>
				</div>
			</div>
		`;
		app.innerHTML += this.footer.get_html();
	}

	async get_info() {
		const root_len = "/profile".length;
		const uri_len = this.real_path?.length;
		if (!uri_len || uri_len < root_len) {
			await this.router.route_error(this.real_path, 400, "Invalid URL");
			return ;
		}
		let user = this.real_path.substring(root_len);
		if (user.length >= 1 && user[0] == "/")
			user = user.substring(1);
		const slash_at = user.indexOf("/");
		if (slash_at != -1 && slash_at != user.length - 1) {
			await this.router.route_error(this.real_path, 404);
			return ;
		}
		if (slash_at == user.length - 1)
			user = user.substring(0, user.length - 1);
		if (user == "")
			user = this.router.login_info.username;
		if (user.indexOf("?") != -1)
			user = user.split("?")[0];
		try {
			const response = await fetch(`${backend_url}/users/${user}?id=${this.router.login_info.id}`);
			if (!response.ok) {
				await this.router.route_error(this.real_path, 500);
				return ;
			}
			const data = await response.json();
			if (!data.success) {
				await this.router.route_error(this.real_path, data.code, data.error);
				return ;
			}
			this.profile_info = data.user;
			this.last_matches = data.games;
			this.friend_count = data.friend_cnt;
			this.game_count = data.game_cnt;
			this.user_stats = data.stats;
			this.is_friends = data.is_friend;
			this.online = data.online;
			this.last_seen = data.last_seen;
		} catch(error: any) {
			await this.router.route_error(this.real_path, 500, error.message);
		};
	}

	async init() {
		if (!this.profile_info)
			return ;
		this.navbar.init();

		const updateFormsHandler = async (e: Event, form: HTMLFormElement, errElement: HTMLElement) => {
				e.preventDefault();
				errElement.textContent = '';
				const formData = new FormData(form);
				try {
					const resp = await fetch(`${backend_url}/auth/update`, {
						method: 'POST',
						credentials: "include",
						body: formData
					});
					if (!resp.ok) {
						errElement.textContent = 'Error: Connection failure';
						return false;
					}
					const data = await resp.json();
					if (!data) {
						errElement.textContent = 'Error: Connection failure';
						return false;
					}
					if (!data.success) {
						errElement.textContent = data.error;
						return false;
					}
					this.router.route(this.real_path);
				} catch (error: any) {
					errElement.textContent = error.message;
					return false;
				}
				return true;
			};

		if (this.profile_info.id == this.router.login_info.id) {
			//  username modal
			const editUsernameBtn = document.getElementById('edit-username-btn');
			const editUsernameModal = document.getElementById('edit-username-modal')!;
			const closeUsernameModal = document.getElementById('close-username-modal')!;
			const editUsernameForm = document.getElementById('edit-username-form') as HTMLFormElement;
			const usernameErrMsg = document.getElementById('username-errmsg')!;

			if (editUsernameBtn) {
				editUsernameBtn.onclick = () => {
					usernameErrMsg.textContent = '';
					editUsernameModal.classList.remove('hidden');
				};
			}

			closeUsernameModal.onclick = () => {
				editUsernameModal.classList.add('hidden');
			};

			editUsernameForm.onsubmit = async (e) => {
				const success = await updateFormsHandler(e, editUsernameForm, usernameErrMsg);
				if (success)
					this.router.route("/profile");
			};

			// pfp modal
			const avatarContainer = document.getElementById('avatar-container');
			const editAvatarModal = document.getElementById('edit-avatar-modal')!;
			const closeAvatarModal = document.getElementById('close-avatar-modal')!;
			const editAvatarForm = document.getElementById('edit-avatar-form') as HTMLFormElement;
			const avatarErrMsg = document.getElementById('avatar-errmsg')!;

			if (avatarContainer) {
				avatarContainer.onclick = () => {
					avatarErrMsg.textContent = '';
					editAvatarModal.classList.remove('hidden');
				};
			}

			closeAvatarModal.onclick = () => {
				editAvatarModal.classList.add('hidden');
			};

			editAvatarForm.onsubmit = async (e) => {
				e.preventDefault();
				avatarErrMsg.textContent = '';
				const formData = new FormData(editAvatarForm);
				try {
					const resp = await fetch(`${backend_url}/auth/update`, {
						method: 'POST',
						credentials: "include",
						body: formData
					});
					if (!resp.ok) {
						avatarErrMsg.textContent = 'Avatar upload failed';
						return ;
					}
					const data = await resp.json();
					if (!data) {
						avatarErrMsg.textContent = 'Avatar upload failed';
						return ;
					}
					if (!data.success) {
						avatarErrMsg.textContent = data.error;
						return ;
					}
					this.router.route(this.real_path);
				} catch (error: any) {
					avatarErrMsg.textContent = error.message;
				}
			};

			// password modal
			const changePasswordBtn = document.getElementById('change-password-btn');
			const changePasswordModal = document.getElementById('change-password-modal')!;
			const closePasswordModal = document.getElementById('close-password-modal')!;
			const changePasswordForm = document.getElementById('change-password-form') as HTMLFormElement;
			const passwordErrMsg = document.getElementById('password-errmsg')!;

			if (changePasswordBtn) {
				changePasswordBtn.onclick = () => {
					passwordErrMsg.textContent = '';
					changePasswordModal.classList.remove('hidden');
				};
			}

			closePasswordModal.onclick = () => {
				changePasswordModal.classList.add('hidden');
			};

			changePasswordForm.onsubmit = async (e) => {
				passwordErrMsg.textContent = '';
				const formData = new FormData(changePasswordForm);
				const pass = formData.get('newpassword');
				const conf = formData.get('confirmPassword');
				formData.delete('confirmPassword');
				if (pass != conf) {
					e.preventDefault();
					passwordErrMsg.textContent = 'Password and confirmation password mismatch';
					return ;
				}
				const success = await updateFormsHandler(e, changePasswordForm, passwordErrMsg);
				if (success)
					changePasswordModal.classList.add('hidden');
			};
		}

		const fa = document.getElementById('follow_area')!;
		if (this.is_friends == false) {
			fa.innerHTML = `
				<button id="followbtn" class="bg-green-600 text-white py-3 pixel-box font-pixelify hover:bg-green-700 clicky w-50">
					+ FOLLOW
				</button>
				<p id="follow-errmsg" class="text-red-500 text-xs h-4 pt-1 text-center"></p>`;
			const fb = document.getElementById('followbtn')!;
			const followErrMsg = document.getElementById('follow-errmsg')!;
			fb.onclick = async () => {
				followErrMsg.textContent = '';
				try {
					const resp = await fetch(`${backend_url}/users/${this.profile_info.username}/friends`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							'user_id': this.router.login_info.id
						})
					});
					if (!resp.ok) {
						followErrMsg.textContent = 'Failed to follow user';
						return ;
					}
					const data = await resp.json();
					if (!data) {
						followErrMsg.textContent = 'Failed to follow user';
						return ;
					}
					if (!data.success) {
						followErrMsg.textContent = data.error;
						return ;
					}
					this.router.route(this.real_path, false);
				} catch (error: any) {
					followErrMsg.textContent = error.message;
				}
			};
		} else if (this.is_friends == true) {
			fa.innerHTML = `
				<button id="followbtn" class="bg-red-600 text-white py-3 pixel-box font-pixelify hover:bg-red-700 clicky w-50 glitch">
					- UNFOLLOW
				</button>
				<p id="follow-errmsg" class="text-red-500 text-xs h-4 pt-1 text-center"></p>`;
			const fb = document.getElementById('followbtn')!;
			const followErrMsg = document.getElementById('follow-errmsg')!;
			fb.onclick = async () => {
				followErrMsg.textContent = '';
				try {
					const resp = await fetch(`${backend_url}/users/${this.profile_info.username}/friends`, {
						method: "DELETE",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							'user_id': this.router.login_info.id
						})
					});
					if (!resp.ok) {
						followErrMsg.textContent = 'Failed to unfollow user';
						return ;
					}
					const data = await resp.json();
					if (!data) {
						followErrMsg.textContent = 'Failed to unfollow user';
						return ;
					}
					if (!data.success) {
						followErrMsg.textContent = data.error;
						return ;
					}
					this.router.route(this.real_path, false);
				} catch (error: any) {
					followErrMsg.textContent = error.message;
				}
			};
		}

		const backgrounds = document.getElementsByClassName("faded_bg");
		for (const background of backgrounds) {
			(background as HTMLButtonElement).onclick = () => {
				background.parentElement?.classList.add('hidden');
			}
		}

		const totalGames = document.getElementById('total-games')!;
		const wins = document.getElementById('wins')!;
		const losses = document.getElementById('losses')!;
		const winRate = document.getElementById('win-rate')!;

		totalGames.textContent = this.game_count.toString();
		winRate.textContent = `${Math.round(this.user_stats.win_rate * 10000) / 100}%`;
		losses.textContent = this.user_stats.losses.toString();
		wins.textContent = this.user_stats.wins.toString();

		const recentGames = document.getElementById('recent-games')!;
		if (recentGames && this.last_matches.length > 0) {
			const games = [];
			for (let game of this.last_matches) {
				games.push({ op_uname: game.local_op ? game.local_op : game.username, op_pfp: backend_url + game.avatarURL, local_game: game.local_op !== null, op_email: game.email,
					result: game.winner_id == this.profile_info.id ? 'WIN' : 'LOSS', score: `${game.p1_score} - ${game.p2_score}`, game: game.game });
			}
	
			recentGames.innerHTML = `
				<div class="grid md:grid-cols-14 grid-cols-10 gap-y-5">
					${games.map(game => `
						<a href="/profile/${this.profile_info.username}" router-link class="hover:opacity-80 transition-opacity flex-row col-span-3 overflow-hidden hidden md:flex"><img src="${backend_url + this.profile_info.avatarURL}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
							<span class="w-35 overflow-hidden" style="padding-top: 5px; padding-left: 7px;">${this.profile_info.username}</span>
						</a>
						<div class="flex col-span-1"><span style="padding-top: 7px;">VS</span></div>
						<a href="/profile/${game.local_game ? this.profile_info.username : game.op_uname}" router-link class="hover:opacity-80 transition-opacity flex flex-row col-span-3"><img src="${game.op_pfp}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
							<span class="w-35 overflow-hidden" style="padding-top: 5px; padding-left: 7px;">${game.op_uname}</span>
						</a>
						<div class="flex col-span-2"><span style="padding-top: 5px;" class="w-full text-right pr-4 ${game.result === 'WIN' ? 'text-green-400' : game.local_game !== true ? 'text-red-400' : ''}">${game.local_game === true ? "Local" : game.result}</span></div>
						<div class="flex col-span-3"><span style="padding-top: 5px;">${game.score}</span></div>
						<div class="flex col-span-1"><span style="padding-top: 5px;">${game.game}</span></div>
					`).join('')}
				</div>`;
		}
	}
}