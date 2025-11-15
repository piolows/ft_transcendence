import Component, { backend_url, Router } from "../scripts/router";

export default class TopPlayers extends Component {
	private top: Array<any> | null = null;

	get_html() {
		return `
			<div class="py-16 text-center">
				<h2 class="text-4xl font-bold mb-12 retro-shadow">TOP PLAYERS</h2>
				<a href="/leaderboards" router-link class="block hover:opacity-90 transition-opacity">
					<div class="inline-block min-w-90 pixel-box bg-opacity-80 bg-blue-900 p-8">
						<div id="toplist" class="flex flex-col space-y-4 font-vt323 text-xl">
							<span class="text-3xl">Connection error!</span>
							<button id="retrybtn" class="pixel-box bg-blue-700 py-3 hover:bg-blue-600 transition-colors clicky w-40 mx-auto font-pixelify">
								RETRY
							</button>
						</div>
					</div>
				</a>
				<a href="/leaderboards" router-link class="block hover:opacity-90 transition-opacity">
					<div class="mt-8 text-sm text-gray-400">Click to view all</div>
				</a>
			</div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}

	async get_top() {
		try {
			const response = await fetch(`${backend_url}/users/top`);
			if (!response.ok) {
				console.error(response.status, response.text);
				return ;
			}
			const data = await response.json();
			if (!data.success) {
				console.error(data.code, data.error);
				return ;
			}
			this.top = data.top_players;
			if (this.top) {
				const fill = document.getElementById('toplist')!;
				if (this.top.length == 0) {
					fill.innerHTML = `<span>No players</span>`;
				}
				else {
					let unpacked_list = "";
					for (let [index, player] of this.top.entries()) {
						unpacked_list += `
							<div class="flex justify-between space-x-16">
								<span class="${index == 0 ? 'rainbow' : 'crt-text'}">${index + 1}. ${player.username}</span>
								<span class="${index == 0 ? 'text-yellow-400' : 'text-orange-400'}">${player.points} PTS</span>
							</div>`;
					}
					fill.innerHTML = unpacked_list;
				}
			}
		} catch(error: any) {
			console.error(error);
			await this.router.route_error(this.real_path, 500, error.message);
		};
	}

	async init() {
		await this.get_top();
		const retry = document.getElementById('retrybtn');
		if (retry)
			retry.onclick = () => this.get_top();
	}
}
