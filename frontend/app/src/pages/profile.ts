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
							<div class="mx-auto" style="float: right;">
								<h1 class="pb-5 retro-shadow">Friends</h1>
								<p>${ this.friend_count }</p>
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
			const response = await fetch(`${backend_url}/users/all`, {
				method: "POST",
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: user })
			});
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
		} catch(error: any) {
			this.router.route_error(this.real_path, 500, error.message);
		};
	}

    init() {
		if (!this.profile_info)
			return ;
        this.navbar.init();

        // all dummy data
        const totalGames = document.getElementById('total-games')!;
        const wins = document.getElementById('wins')!;
        const losses = document.getElementById('losses')!;
        const winRate = document.getElementById('win-rate')!;

        totalGames.textContent = this.game_count.toString();
        winRate.textContent = `${this.user_stats.win_rate * 100}%`;
        losses.textContent = this.user_stats.losses.toString();
        wins.textContent = this.user_stats.wins.toString();

        const recentGames = document.getElementById('recent-games');
        if (recentGames && this.game_count > 0) {
            const dummyGames = [
                { opponent: 'Player1', result: 'WIN', score: '10-8' },
                { opponent: 'Player2', result: 'LOSS', score: '7-10' },
                { opponent: 'Player3', result: 'WIN', score: '10-5' }
            ];

            recentGames.innerHTML = dummyGames
                .map(game => `
                    <div class="flex justify-between items-center font-silkscreen">
                        <span>${game.opponent}</span>
                        <span class="${game.result === 'WIN' ? 'text-green-400' : 'text-red-400'}">${game.result}</span>
                        <span>${game.score}</span>
                    </div>
                `).join('');
        }
    }
}