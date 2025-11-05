import Component, { Router } from "../scripts/router";

export default class TopPlayers extends Component {
	private top: Array<Array<string>> = [];

	get_html() {
		return `
		<div class="py-16 text-center">
            <h2 class="text-4xl font-bold mb-12 retro-shadow">TOP PLAYERS</h2>
            <a href="/leaderboards" router-link class="block hover:opacity-90 transition-opacity">
                <div class="inline-block pixel-box bg-opacity-80 bg-blue-900 p-8">
                    <div class="space-y-4 font-vt323 text-xl">
                        <div class="flex justify-between space-x-16">
                            <span class="rainbow">1. PLAYER_ONE</span>
                            <span class="text-yellow-400">9999 PTS</span>
                        </div>
                        <div class="flex justify-between space-x-16">
                            <span class="crt-text">2. PLAYER_TWO</span>
                            <span class="text-gray-400">8888 PTS</span>
                        </div>
                        <div class="flex justify-between space-x-16">
                            <span class="crt-text">3. PLAYER_THREE</span>
                            <span class="text-orange-400">7777 PTS</span>
                        </div>
                    </div>
                </div>
                <div class="mt-8 text-sm text-gray-400">Click to view all</div>
            </a>
        </div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		app.innerHTML = this.get_html();
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
}
