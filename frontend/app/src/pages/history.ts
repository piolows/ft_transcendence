import Component, { backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import ListView from "../components/list_view";

export default class History extends Component {
	private navbar = new NavBar(this.router);
	private listview = new ListView(this.router);
	private footer = new Footer(this.router);
	private profile_info: any;
	private games: Array<any> = [];

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		if (!this.profile_info)
			return ;
		for (let game of this.games) {
			const info = { op_uname: game.username, op_pfp: backend_url + game.avatarURL, op_email: game.email,
				result: game.winner_id == this.profile_info.id ? 'WIN' : 'LOSS', score: `${game.p1_score} - ${game.p2_score}` };
			const row = [];
			row.push({ value: `<div class="flex-row md:flex"><img src="${backend_url + this.profile_info.avatarURL}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
				<span style="padding-top: 5px; padding-left: 7px;">${this.profile_info.username}</span></div>`, cols: 4 });
			row.push({ value: `<div class="flex"><span style="padding-top: 7px;">VS</span></div>`, cols: 1 });
			row.push({ value: `<div class="flex flex-row"><img src="${info.op_pfp}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
				<span style="padding-top: 5px; padding-left: 7px;">${info.op_uname}</span></div>`, cols: 4 });
			row.push({ value: `<div class="flex"><span style="padding-top: 5px;" class="${info.result === 'WIN' ? 'text-green-400' : 'text-red-400'}">${info.result}</span></div>`, cols: 2 });
			row.push({ value: `<div class="flex"><span style="padding-top: 5px;">${info.score}</span></div>`, cols: 3 });
			this.listview.add_row(row);
		}
		await this.navbar.load(app);
		app.innerHTML += this.listview.get_html() + this.footer.get_html();
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
		if (user == "")
			user = this.router.login_info.username;
		const params = new URLSearchParams(window.location.search);
		const page = params.get("page") ?? 0;
		try {
			const response = await fetch(`${backend_url}/users/${user}/history?page=${page}`);
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
		} catch(error: any) {
			await this.router.route_error(this.real_path, 500, error.message);
		};
	}

	init() {
		if (!this.profile_info)
			return ;
		this.navbar.init();
	}
}