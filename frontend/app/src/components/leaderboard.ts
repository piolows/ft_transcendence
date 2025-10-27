import Component, { Router } from "../scripts/router";

export default class Leaderboard extends Component {
	constructor(router: Router) {
		super(router);
	}

	get_html() {
		return `
		<div class="py-16 text-center">
            <h2 class="text-4xl font-bold mb-12 retro-shadow">TOP PLAYERS</h2>
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
        </div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}
