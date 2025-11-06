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
			<main class="container mx-auto px-4 py-8 pr-8">
				<!-- profile header -->
				<div class="flex items-center justify-center mb-12">
					<div class="pixel-box bg-blue-900 p-8 w-auto">
						<div class="flex flex-col md:flex-row justify-between">
							<div class="flex items-center space-x-8">
								<img src="${backend_url + this.profile_info.avatarURL}" 
									class="w-32 h-32 rounded-full pixel-box" alt="Profile Picture">
								<div class="pr-16">
									<h1 class="text-3xl font-bold rainbow mb-2">${this.profile_info.username}</h1>
									<p class="text-gray-400 font-silkscreen">${this.profile_info.email}</p>
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
						<div id="recent-games" class="space-y-4 h-32 sm:h-40" style="max-height: 160px;">
							<div class="text-center font-silkscreen text-gray-400">
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
		if (user == "")
			user = this.router.login_info.username;
		const slash = user.indexOf("/");
		if (slash != -1 && slash != user.length - 1) {
			await this.router.route_error(this.real_path, 404);
			return ;
		}
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
		} catch(error: any) {
			await this.router.route_error(this.real_path, 500, error.message);
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
	
			recentGames.innerHTML = `
				<div class="grid md:grid-cols-14 grid-cols-10 gap-y-5">
					${games.map(game => `
						<a href="/profile/${this.profile_info.username}" router-link class="hover:opacity-80 transition-opacity flex-row col-span-4 overflow-hidden hidden md:flex"><img src="${backend_url + this.profile_info.avatarURL}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
							<span class="w-35 overflow-hidden" style="padding-top: 5px; padding-left: 7px;">${this.profile_info.username}</span>
						</a>
						<div class="flex col-span-1"><span style="padding-top: 7px;">VS</span></div>
						<a href="/profile/${game.op_uname}" router-link class="hover:opacity-80 transition-opacity flex flex-row col-span-4"><img src="${game.op_pfp}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
							<span class="w-35 overflow-hidden" style="padding-top: 5px; padding-left: 7px;">${game.op_uname}</span>
						</a>
						<div class="flex col-span-2"><span style="padding-top: 5px;" class="w-full text-right pr-4 ${game.result === 'WIN' ? 'text-green-400' : 'text-red-400'}">${game.result}</span></div>
						<div class="flex col-span-3"><span style="padding-top: 5px;">${game.score}</span></div>
					`).join('')}
				</div>`;
		}
	}
}