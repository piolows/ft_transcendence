import Component, { backend_url, Router } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import ListView from "../components/list_view";

const FRIENDS_PER_PAGE = 8;

export default class Friends extends Component {
	private navbar = new NavBar(this.router);
	private listview = new ListView(this.router);
	private footer = new Footer(this.router);
	private profile_info: any;
	private friends: Array<any> = [];
	private max_page: number = 1;
	private page: number = 1;

	constructor(router: Router) {
		super(router);
		this.listview.per_page = FRIENDS_PER_PAGE;
		this.listview.bg_color = "bg-blue-800";
		this.listview.text_color = "text-white";
		this.listview.items_str = "friends";
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		if (!this.profile_info)
			return ;
		this.listview.page = this.page;
		this.listview.max_page = this.max_page;
		this.listview.rows = [];
		const follow = (id: number) => `
			<div class="flex"><button id="follow-${id}" class="bg-green-600 text-white pixel-box font-pixelify hover:bg-green-700 clicky h-10 w-40">
				+ Follow
			</button></div>`;
		const unfollow = (id: number) => `
			<div class="flex"><button id="follow-${id}" class="bg-red-600 text-white pixel-box font-pixelify hover:bg-red-700 clicky h-10 w-40">
				- Unfollow
			</button></div>`;
		for (const [idx, friend] of this.friends.entries()) {
			const row =  [{ value: `<a href="/profile/${friend.username}" router-link class="hover:opacity-80 transition-opacity flex flex-col sm:flex-row overflow-hidden"><img src="${backend_url + friend.avatarURL}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
				<span style="padding-top: 5px; padding-left: 7px;">${friend.username}</span></a>`, cols: 2 },
				{ value: `<div><span>${friend.points} PTS</span></div>`, cols: 2 },
				{ value: `<div><span>${friend.win_rate * 100}% Win Rate</span></div>`, cols: 2 }];
			if (friend.id != this.router.login_info.id)
				row.push({ value: friend.is_friend ? unfollow(idx) : follow(idx), cols: 1 });
			else
				row.push({value: '', cols: 1 });
			this.listview.add_row(row);
		}
		await this.navbar.load(app);
		app.innerHTML += `
			<h1 class="h-full text-center text-5xl font-bold mb-12 retro-shadow">FRIENDS LIST</h1>
			<div class="flex flex-row items-center justify-center w-full gap-x-5"><p>Friends of</p><div>
			<a href="/profile/${this.profile_info.username}" router-link class="hover:opacity-80 transition-opacity flex-row flex overflow-hidden">
			<img src="${backend_url + this.profile_info.avatarURL}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #000;"/>
			<span style="padding-top: 5px; padding-left: 7px;">${this.profile_info.username}</span></a></div></div>
			<div class="w-full h-120">${this.listview.get_html()}</div>` + this.footer.get_html();
	}

	async get_info() {
		const root_len = "/friends".length;
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
			this.page = page ? parseInt(page) : 1;
			if (this.page < 1)
				this.router.route(`/friends/${user}?page=1`);
			const response = await fetch(`${backend_url}/users/${user}/friends?page=${this.page}&uid=${this.router.login_info.id}`);
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
			this.friends = data.friends;
			this.max_page = Math.max(Math.floor(data.count / FRIENDS_PER_PAGE) + (data.count % FRIENDS_PER_PAGE > 0 ? 1 : 0), 1);
			if (this.page > this.max_page)
				this.router.route(`/friends/${user}?page=${this.max_page}`);
		} catch(error: any) {
			console.error(error);
			await this.router.route_error(this.real_path, 500, error.message);
		};
	}

	init() {
		if (!this.profile_info)
			return ;
		this.navbar.init();
		for (let i = 0; i < this.friends.length; i++) {
			if (this.friends[i].id == this.router.login_info.id)
				continue;
			const fb = document.getElementById(`follow-${i}`)!;
			if (!this.friends[i].is_friend) {
				fb.onclick = async () => {
					try {
						const resp = await fetch(`${backend_url}/users/${this.friends[i].username}/friends`, {
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
			} else {
				fb.onclick = async () => {
					try {
						const resp = await fetch(`${backend_url}/users/${this.friends[i].username}/friends`, {
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
		}
		const left = document.getElementById('prev_btn');
		if (left)
			left.onclick = () => this.router.route(`/friends/${this.profile_info.username}?page=${this.page - 1}`);
		const right = document.getElementById('next_btn');
		if (right)
			right.onclick = () => this.router.route(`/friends/${this.profile_info.username}?page=${this.page + 1}`);
		const pager = document.getElementById('pager') as HTMLSelectElement | null;
		if (pager)
			pager.onchange = () => this.router.route(`/friends/${this.profile_info.username}?page=${pager.value}`);
	}
}
