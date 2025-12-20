export const HTTP_CODES: any = {
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Page Not Found",
	500: "Internal Server Error",
	503: "Service Unavailable",
}

export var backend_url = "https://localhost:4161";
export var sockets_url = "https://localhost:4116";
export var backend_websocket = "wss://localhost:4116";

export default abstract class Component {
	router: Router;
	real_path: string = "";
	back_url: string = "/";

	constructor(router: Router) {
		this.router = router;
	}

	async load(app: HTMLDivElement | HTMLElement) {}
	async init() {}
	unload() {}
}

class Loading extends Component {
	private dot_count = 0;
	state = "loading";

	private get_text() {
		switch (this.state) {
			case "loading":
				return "Loading";
			case "offline":
				return "You are currently offline.\nCheck your internet connection bro!";
			case "timeout":
				return "Connection timed out... sowwy >_<\nTry refreshing pwease.";
			default:
				return "";
		}
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = `
			<div class="flex flex-box h-screen w-full justify-center items-center">
				<p id="loading_txt" class="text-left ${this.state == "loading" ? 'w-120' : 'w-150'} mx-auto text-4xl"">
					${this.get_text()}
				</p>
			</div>`;
	}

	async init() {
		const loading_text = document.getElementById('loading_txt');
		await new Promise(() => {
			const check = () => {
				if (this.state == "loading" && loading_text) {
					if (this.dot_count >= 3) {
						loading_text.innerText = "Loading";
						this.dot_count = 0;
					}
					else {
						loading_text.innerText += " .";
						this.dot_count += 1;
					}
					setTimeout(check, 300);
				}
			};
			check();
		});
	}

	unload() {
		this.state = "idle";
	}
}

export class DefaultErrorPage extends Component {
	error_code = 404;
	custom_msg: any;
	
	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = `
			<div class="center text-center mt-50">
				<h1>${ this.custom_msg ? this.custom_msg : HTTP_CODES[this.error_code] }</h1>
				<h4>Error code ${ this.error_code }</h4>
			</div>`;
	}
}

export class Router {
	private routes = new Map<string, any>();
	private currpage: Component | null = null;
	private errpage: DefaultErrorPage;
	private loader: Loading;
	private presence_interval_id: number | null = null;
	last_path: string|null = "";
	history_len: number = 1;
	auth_route: boolean = false;
	app: HTMLDivElement | HTMLElement;
	login_info: any = null;
	loggedin = false;
	google_client: any;

	constructor(app: HTMLDivElement | null) {
		this.errpage = new DefaultErrorPage(this);
		this.app = app ?? document.body;
		this.loader = new Loading(this);

		// Handle back/forward buttons
		window.onpopstate = (event) => {
			event.preventDefault();
			const path = event.state?.route || location.pathname;
			this.route(path, false);
		};

		// Intercept clicks on <a router-link>
		document.addEventListener("click", (e) => {
			const target = (e.target as HTMLElement).closest("a[router-link]") as HTMLAnchorElement | null;
			if (!target || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
				return;
			e.preventDefault();
			this.route(target.getAttribute("href")!);
		});
	}

	private wait_for_google(): Promise<void> {
		// Wait for the Google script to load
		return new Promise((resolve, reject) => {
			const start = Date.now();
			const timeout = 5000;

			const check = () => {
				if ((window as any).google?.accounts?.id) {
					resolve();
					return;
				}

				// Offline - immediate failure
				if (!navigator.onLine) {
					reject(new Error("offline"));
					return;
				}

				// Timeout - failure
				if (Date.now() - start > timeout) {
					reject(new Error("timeout"));
					return;
				}

				setTimeout(check, 100);
			};
		
			check();
		});
	}

	private async setup_google() {
		await this.wait_for_google();
		(window as any).google.accounts.id.initialize({
			client_id: "336093315647-mlq5ufc06999l3vhrvbimtn36jqvmgtk.apps.googleusercontent.com",
			callback: (resp: any) => this.handle_google_login(resp),
			auto_select: false
		});
	}

	private async check_session() {
		try {
			const res = await fetch(backend_url + "/auth/me", {
				credentials: "include",
			});
			const data = await res.json();

			if (data.loggedIn) {
				this.login_info = data.user;
				this.loggedin = true;
			} else {
				this.login_info = null;
				this.loggedin = false;
			}
		} catch (err) {
			console.error("Failed to check session:", err);
		}
	}

	// Sends heartbeat of user (online status) every 30 seconds
	start_presence_heartbeat() {
		if (this.presence_interval_id !== null) {
			return;
		}
		if (!this.loggedin || !this.login_info || !this.login_info.id) {
			return ;
		}

		fetch(backend_url + "/users/status", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: this.login_info.id }),
		}).catch((err) => {
			console.error("Failed to send presence heartbeat:", err);
		});
		this.presence_interval_id = window.setInterval(() => {
			if (!this.loggedin || !this.login_info || !this.login_info.id) {
				return ;
			}
			fetch(backend_url + "/users/status", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: this.login_info.id }),
			}).catch((err) => {
				console.error("Failed to send presence heartbeat:", err);
			});
		}, 5_000);
	}

	// To be called where we log out / session expires
	stop_presence_heartbeat() {
		if (this.presence_interval_id !== null) {
			clearInterval(this.presence_interval_id);
			this.presence_interval_id = null;
		}
	}

	private handle_google_login(idToken: any) {
		fetch(backend_url + "/auth/google-login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: idToken.credential }),
			credentials: "include",
		})
		.then(res => res.json())
		.then(data => {
			this.login_info = data.user;
			this.start_presence_heartbeat();
			this.route(window.location.pathname, "replace");
		})
		.catch(err => console.error("Error sending token to backend:", err));
	}

	private root_without_wild(path: string) {
		for (const route of this.routes.keys()) {
			if (route != "/" && path.includes(route))
				return route;
		}
		if (path.indexOf("?") != -1) {
			return path.substring(0, path.indexOf("?"));
		}
		return path;
	}

	private bad_route(real_path: string, path: string, route: any) {
		if (!route)
			return false;
		if (real_path == path && route.type == "strict_wild")
			return true;
		if (real_path != path && route.type != "wild" && route.type != "strict_wild") {
			if (real_path.indexOf("?") != -1 && this.root_without_wild(real_path) == path)
					return false;
			return true;
		}
		return false;
	}
		

	set_error_handler(handler: DefaultErrorPage) {
		this.errpage = handler;
	}

	add_route(route: string, page: Component, opts?: any) {
		this.routes.set(route, {
			page: page,
			auth: opts?.auth,
			type: opts?.type,
			back_url: opts?.back_url,
		});
	}

	async loading(state: boolean = true) {
		if (state == true) {
			this.currpage?.unload();
			await this.loader.load(this.app);
			this.loader.init();
		}
		else {
			this.loader.unload();
		}
	}

	async route_error(path: string, code: number, err_msg?: string) {
		this.currpage?.unload();
		this.errpage.error_code = code;
		this.errpage.custom_msg = err_msg;
		await this.errpage.load(this.app);
		await this.errpage.init();
		this.currpage = this.errpage;
		this.errpage.error_code = 404;
		this.errpage.custom_msg = undefined;
		window.scrollTo(0, 0);
		history.replaceState({ route: path }, '', path);
	}

	async route(path: string, push: any = true) {
		if (!path) {
			path = window.location.pathname;
		}
		let real_path = path;
		path = this.root_without_wild(path);
		const route = this.routes.get(path);
		if (this.bad_route(real_path, path, route)) {
			await this.route_error(real_path, 404);
			return ;
		}
		this.check_session().then(async () => {
			if (!this.loggedin && route?.auth) {
				if (!this.currpage || !route?.auth_overlay)
					await this.route(route.type == "overlay" ? route.back_url : "/", "replace");
				await this.route("/login", false);
				return ;
			}
			if (!this.currpage && route?.type == "overlay") {
				await this.route(route.back_url, "replace");
				await this.route(real_path, false);
				return ;
			}
			if (route?.auth == false && this.loggedin)
				return ;
			if (this.currpage) {
				this.last_path = this.currpage.real_path;
				this.history_len = history.length;
			}
			this.auth_route = route?.auth;
			if ((!this.currpage && push == true) || route.type == "overlay")
				push = false;
			this.currpage?.unload();
			if (push == true || push == "force")
				history.pushState({ route: real_path }, '', real_path);
			else if (push == "replace")
				history.replaceState({ route: real_path }, '', real_path);
			if (!route) {
				this.currpage = this.errpage;
				await this.errpage.load(this.app);
				await this.errpage.init();
			} else {
				this.currpage = route.page;
				this.currpage && (this.currpage.real_path = real_path);
				await this.currpage?.load(this.app);
				await this.currpage?.init();
			}
			if (route && route.type != "overlay")
				window.scrollTo(0, 0);
		});
	}

	async start() {
		this.loading();
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}
		try {
			await this.setup_google();
		} catch (error: any) {
			if (error.message == "offline" || error.message == "timeout") {
				this.loader.state = error.message;
				await this.loader.load(this.app);
				return ;
			}
			console.error(error.status, error);
		}
		this.start_presence_heartbeat();
		this.loading(false);
		this.route(location.pathname);
	}
}