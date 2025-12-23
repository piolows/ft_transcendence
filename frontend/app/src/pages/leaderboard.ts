import Component, { backend_url, Router } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import ListView from "../components/list_view";

const PLAYERS_PER_PAGE = 10;

export const colors = [
	'text-yellow-400',
	'text-gray-300',
	'text-orange-400',
	'text-blue-400',
	'text-purple-400',
	'text-green-400',
	'text-red-400',
	'text-pink-400',
	'text-cyan-400',
	'text-indigo-400',
];


export default class Leaderboard extends Component {
    private navbar = new NavBar(this.router);
    private footer = new Footer(this.router);
	private board = new ListView(this.router);
	private page = 1;
	private max_page = 1;
	private players: Array<any> | undefined;

	constructor(router: Router) {
		super(router);
		this.board.bg_color = "bg-blue-900 px-6 pt-4";
		this.board.text_color = "";
		this.board.items_str = "players";
	}

    async load(app: HTMLDivElement | HTMLElement) {
		await this.get_top();
		this.board.rows = [];
		this.board.page = this.page;
		this.board.max_page = this.max_page;
		if (this.players && this.players.length > 0) {
			this.board.add_row([
				{ value: '<p class="text-3xl retro-shadow text-left">RANK</p>', col: 1 },
				{ value: '<p class="text-3xl retro-shadow text-center">PLAYER</p>', col: 3 },
				{ value: '<p class="text-3xl retro-shadow text-right">POINTS</p>', col: 1 }
			], { bg_color: "pb-6" });
			for (const [idx, player] of this.players.entries()) {
				const row =  [
					{ value: `<p class="${colors[idx]} text-left text-2xl" style="font-family: var(--font-vt323);">#${idx + 1}</p>`, cols: 1 },
					{ value: `<p class="${idx == 0 ? 'rainbow' : 'crt-text'} text-center text-2xl" style="font-family: var(--font-vt323);">${player.username}</p>`, cols: 3 },
					{ value: `<p class="${colors[idx]} text-right text-2xl" style="font-family: var(--font-vt323);">${player.points} PTS</p>`, cols: 1 }
				];
				this.board.add_row(row);
			}
		}
        app.innerHTML = `
			${ this.navbar.get_html() }
            <main class="container mx-auto px-4 py-8">
                <div class="text-center">
                    <h1 class="text-5xl font-bold mb-12 retro-shadow">LEADERBOARD</h1>
					${ this.board.get_html() }
                </div>
            </main>
			${ this.footer.get_html() }`;
    }
	
	async get_top() {
		const params = new URLSearchParams(window.location.search);
		const page = params.get("page");
		try {
			if (page && (page.length > 11 || !/^[0-9]+$/.test(page)))
				this.page = 1;
			else
				this.page = parseInt(page ?? "1");
			const response = await fetch(`${backend_url}/users/top?page=${this.page}`);
			if (!response.ok) {
				console.error(response.status, response.text);
				return ;
			}
			const data = await response.json();
			if (!data.success) {
				console.error(data.code, data.source, data.error);
				return ;
			}
			this.players = data.top_players;
			if (data.player_count) {
				this.max_page = Math.max(Math.floor(data.player_count / PLAYERS_PER_PAGE) + (data.player_count % PLAYERS_PER_PAGE > 0 ? 1 : 0), 1);
			}
			if (this.page > this.max_page) {
				this.router.route(`/leaderboard`);
				return ;
			}
		} catch(error: any) {
			console.error(error);
			await this.router.route_error(this.real_path, 500, error.message);
		};
	}

    async init() {
        this.navbar.init();

		const left = document.getElementById('prev_btn');
		if (left) {
			left.onclick = () => this.router.route(`/leaderboard?page=${this.page - 1}`);
		}
		const right = document.getElementById('next_btn');
		if (right) {
			right.onclick = () => this.router.route(`/leaderboard?page=${this.page + 1}`);
		}
		const pager = document.getElementById('pager') as HTMLSelectElement | null;
		if (pager) {
			pager.onchange = () => this.router.route(`/leaderboard?page=${pager.value}`);
		}
    }
}