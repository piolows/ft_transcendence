import Component, { backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";

export default class Profile extends Component {
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);
	private profile_info: any;
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
			<main class="container mx-auto px-4 py-8">
				<!-- profile header -->
				<div class="flex items-center justify-center mb-12">
					<div class="pixel-box bg-blue-900 p-8 w-full max-w-4xl">
						<div class="flex items-center space-x-8">
							<img src="${backend_url + this.profile_info.avatarURL}" 
								class="w-32 h-32 rounded-full pixel-box" alt="Profile Picture">
							<div>
								<h1 class="text-4xl font-bold rainbow mb-2">${this.profile_info.username}</h1>
								<p class="text-gray-400 font-silkscreen">${this.profile_info.email}</p>
							</div>
							<div class="mx-auto">
								<h1 class="pb-5 retro-shadow">Friends</h1>
								<p>${ this.friend_count }</p>
							</div>
							<div id="follow_area" class="mx-auto" style="float: right;">
								
							</div>
						</div>
					</div>
				</div>

				<!-- stats -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
					<!-- Game Statistics -->
					<div class="pixel-box bg-blue-900 p-6">
						<h2 class="text-2xl font-bold retro-shadow mb-6">Game Statistics</h2>
						<div class="space-y-4">
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
					<div class="pixel-box bg-blue-900 p-6">
						<h2 class="text-2xl font-bold retro-shadow mb-6">Recent Activity</h2>
						<div id="recent-games" class="space-y-4">
							<div class="text-center font-silkscreen text-gray-400">
								No recent games
							</div>
						</div>
					</div>
				</div>
			</main>
		`;
		app.innerHTML += this.footer.get_html();
	}

	async get_info() {
		const root_len = "/profile".length;
		const uri_len = this.real_path?.length;

		if (!uri_len || uri_len < root_len) {
			this.router.route_error(this.real_path, 400, "Invalid URL");
			return ;
		}
		let user = this.real_path.substring(root_len);
		if (user.length >= 1 && user[0] == "/")
			user = user.substring(1);
		if (user == "")
			user = this.router.login_info.username;
		try {
			const response = await fetch(`${backend_url}/users/${user}?id=${this.router.login_info.id}`);
			if (!response.ok) {
				this.router.route_error(this.real_path, 500);
				return ;
			}
			const data = await response.json();
			if (!data.success) {
				this.router.route_error(this.real_path, data.code, data.error);
				return ;
			}
			this.profile_info = data.user;
			this.last_matches = data.games;
			this.friend_count = data.friend_cnt;
			this.game_count = data.game_cnt;
			this.user_stats = data.stats;
			this.is_friends = data.is_friend;
		} catch(error: any) {
			this.router.route_error(this.real_path, 500, error.message);
		};
	}

	init() {
		if (!this.profile_info)
			return ;
		this.navbar.init();

		const fa = document.getElementById('follow_area')!;
		if (this.is_friends == false) {
			fa.innerHTML = `
				<button id="followbtn" class="bg-green-600 text-white py-3 pixel-box font-pixelify hover:bg-green-700 clicky w-50">
					+ Follow
				</button>`;
			const fb = document.getElementById('followbtn')!;
			fb.onclick = async () => {
				try {
					const resp = await fetch(`${backend_url}/users/${this.profile_info.username}/friends`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							'user_id': this.router.login_info.id
						})
					});
					if (!resp.ok) {
						console.error(`Error while sending request: ${resp.status} - ${resp.text}`);
						return ;
					}
					const data = await resp.json();
					if (!data) {
						console.error(`Error while sending request: 500 - Received invalid response`);
						return ;
					}
					if (!data.success) {
						console.error(`Error while sending request: ${data.code} - ${data.error}`);
						return ;
					}
					this.router.route(this.real_path, false);
				} catch (error: any) {
					console.error(error.message);
				}
			};
		} else if (this.is_friends == true) {
			fa.innerHTML = `
				<button id="followbtn" class="bg-red-600 text-white py-3 pixel-box font-pixelify hover:bg-red-700 clicky w-50">
					- Unfollow
				</button>`;
			const fb = document.getElementById('followbtn')!;
			fb.onclick = async () => {
				try {
					const resp = await fetch(`${backend_url}/users/${this.profile_info.username}/friends`, {
						method: "DELETE",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							'user_id': this.router.login_info.id
						})
					});
					if (!resp.ok) {
						console.error(`Error while sending request: ${resp.status} - ${resp.text}`);
						return ;
					}
					const data = await resp.json();
					if (!data) {
						console.error(`Error while sending request: 500 - Received invalid response`);
						return ;
					}
					if (!data.success) {
						console.error(`Error while sending request: ${data.code} - ${data.error}`);
						return ;
					}
					this.router.route(this.real_path, false);
				} catch (error: any) {
					console.error(error.message);
				}
			};
		}
		// const fa = document.getElementById('follow_area')!;
		// if (this.is_friends == true) {
		// 	fa.innerHTML = `
		// 		<div class="mx-auto" style="float: right;">
		// 			<button id="followbtn" class="bg-green-600 text-white py-3 pixel-box font-pixelify hover:bg-green-700 clicky w-50">
		// 				+ Follow
		// 			</button>
		// 		</div>`;
		// 	const fb = document.getElementById('followbtn')!;
		// 	fb.onclick = () => {

		// 	};
		// } else if (this.is_friends == false) {
		// 	fa.innerHTML = `
		// 		<div class="mx-auto" style="float: right;">
		// 			<button id="followbtn" class="bg-red-600 text-white py-3 pixel-box font-pixelify hover:bg-red-700 clicky w-50">
		// 				- Unfollow
		// 			</button>
		// 		</div>`;
		// }

		const totalGames = document.getElementById('total-games')!;
		const wins = document.getElementById('wins')!;
		const losses = document.getElementById('losses')!;
		const winRate = document.getElementById('win-rate')!;

		totalGames.textContent = this.game_count.toString();
		winRate.textContent = `${this.user_stats.win_rate * 100}%`;
		losses.textContent = this.user_stats.losses.toString();
		wins.textContent = this.user_stats.wins.toString();

		const recentGames = document.getElementById('recent-games')!;
		if (recentGames && this.last_matches.length > 0) {
			const games = [];
			for (let game of this.last_matches) {
				games.push({ op_uname: game.username, op_pfp: backend_url + game.avatarURL, op_email: game.email,
					result: game.winner_id == this.profile_info.id ? 'WIN' : 'LOSS', score: `${game.p1_score} - ${game.p2_score}` });
			}
			// EMAD EMAD EMAD (ADD USERNAME)
					// <div class="flex flex-row justify-between items-center font-silkscreen pr-10">
			recentGames.innerHTML = `
				<div class="grid grid-cols-14 gap-y-5">
					${games.map(game => `
						<div class="col-span-1"><img src="${backend_url + this.profile_info.avatarURL}" style="width: 32px; height: 32px;"/></div>
						<div class="col-span-3"><span>${this.profile_info.username}</span></div>
						<div class="col-span-1"><span>VS</span></div>
						<div class="col-span-1"><img src="${game.op_pfp}" style="width: 32px; height: 32px;"/></div>
						<div class="col-span-3"><span>${game.op_uname}</span></div>
						<div class="col-span-2"><span class="${game.result === 'WIN' ? 'text-green-400' : 'text-red-400'}">${game.result}</span></div>
						<div class="col-span-3"><span>${game.score}</span></div>
					`).join('')}
				</div>`;
		}
	}
}