import Component, { backend_url, Router } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import ListView from "../components/list_view";

const GAMES_PER_PAGE = 10;

export default class History extends Component {
	private navbar = new NavBar(this.router);
	private listview = new ListView(this.router);
	private footer = new Footer(this.router);
	private profile_info: any;
	private games: Array<any> = [];
	private max_page: number = 1;
	private page: number = 1;

	constructor(router: Router) {
		super(router);
		this.listview.per_page = GAMES_PER_PAGE;
		this.listview.bg_color = "bg-blue-800";
		this.listview.text_color = "text-white";
		this.listview.items_str = "games";
		this.listview.col_sets = "grid-cols-10 lg:grid-cols-14";
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		if (!this.profile_info)
			return ;
		this.back_url = `/profile/${this.profile_info.username}`;
		this.navbar.back_url = `/profile/${this.profile_info.username}`;
		this.listview.page = this.page;
		this.listview.max_page = this.max_page;
		this.listview.rows = [];
		for (let game of this.games) {
			const info = { op_uname: game.username, op_pfp:
			 backend_url + game.avatarURL, op_email: game.email,
				result: game.winner_id == this.profile_info.id ? 'WIN' : 'LOSS', score: `${game.p1_score} - ${game.p2_score}` };
			const row = [];
			row.push({ value: `<a href="/profile/${this.profile_info.username}" router-link class="hover:opacity-80 transition-opacity flex flex-row overflow-hidden">
				<img src="${backend_url + this.profile_info.avatarURL}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
				<span style="padding-top: 5px; padding-left: 7px;">${this.profile_info.username}</span></a>`, cols: 4, classes: "hidden lg:flex" });
			row.push({ value: `<div class="flex"><span style="padding-top: 7px;">VS</span></div>` });
			row.push({ value: `<a href="/profile/${info.op_uname}" router-link class="hover:opacity-80 transition-opacity flex flex-row overflow-hidden">
				<img src="${info.op_pfp}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
				<span style="padding-top: 5px; padding-left: 7px;">${info.op_uname}</span></a>`, cols: 4 });
			row.push({ value: `<div class="flex"><span style="padding-top: 5px;" class="${info.result === 'WIN' ? 'text-green-400' : 'text-red-400'}">${info.result}</span></div>`, cols: 2 });
			row.push({ value: `<div class="flex"><span style="padding-top: 5px;">${info.score}</span></div>`, cols: 3 });
			this.listview.add_row(row);
		}
		await this.navbar.load(app);
		app.innerHTML += `
			<div class="container mx-auto px-4 py-8">
				<h1 class="text-center text-5xl font-bold mb-12 retro-shadow">MATCH HISTORY</h1>
				<div class="flex justify-center">${this.listview.get_html()}</div>
			</div>` + this.footer.get_html();
	}

	async get_info() {
		const root_len = "/history".length;
		const uri_len = this.real_path?.length;

		if (!uri_len || uri_len < root_len) {
			await this.router.route_error(this.real_path, 400, "Invalid URL");
			return ;
		}
		let user = this.real_path.substring(root_len);
		if (user.length >= 1 && user[0] == "/")
			user = user.substring(1);
		if (user.indexOf("?") != -1)
			user = user.substring(0, user.indexOf("?"));
		const slash_at = user.indexOf("/");
		if (slash_at != -1 && slash_at != user.length - 1) {
			await this.router.route_error(this.real_path, 404);
			return ;
		}
		if (slash_at == user.length - 1)
			user = user.substring(0, user.length - 1);
		if (user == "")
			user = this.router.login_info.username;
		const params = new URLSearchParams(window.location.search);
		try {
			const page = params.get("page");
			if (page && (page.length > 11 || !/^[0-9]+$/.test(page)))
				this.page = 1;
			else
				this.page = parseInt(page ?? "1");
			if (this.page < 1) {
				this.router.route(`/history/${user}?page=1`);
				return ;
			}
			const response = await fetch(`${backend_url}/users/${user}/history?page=${this.page}`);
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
			this.games = data.games;
			this.max_page = Math.max(Math.floor(data.count / GAMES_PER_PAGE) + (data.count % GAMES_PER_PAGE > 0 ? 1 : 0), 1);
			if (this.page > this.max_page) {
				this.router.route(`/history/${user}?page=${this.max_page}`);
				return ;
			}
		} catch(error: any) {
			console.error(error);
			await this.router.route_error(this.real_path, 500, error.message);
		};
	}

	async init() {
		if (!this.profile_info)
			return ;
		this.navbar.init();
		const left = document.getElementById('prev_btn');
		if (left) {
			left.onclick = () => this.router.route(`/history/${this.profile_info.username}?page=${this.page - 1}`);
		}
		const right = document.getElementById('next_btn');
		if (right) {
			right.onclick = () => this.router.route(`/history/${this.profile_info.username}?page=${this.page + 1}`);
		}
		const pager = document.getElementById('pager') as HTMLSelectElement | null;
		if (pager) {
			pager.onchange = () => this.router.route(`/history/${this.profile_info.username}?page=${pager.value}`);
		}
	}
}
