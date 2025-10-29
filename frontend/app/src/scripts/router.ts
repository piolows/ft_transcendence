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

	constructor(router: Router) {
		this.router = router;
	}

	async load(app: HTMLDivElement | HTMLElement) {}
	init() {}
	unload() {}
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
	app: HTMLDivElement | HTMLElement;
	login_info: any = null;
	loggedin = false;
	google_client: any;

	constructor(app: HTMLDivElement | null) {
		this.errpage = new DefaultErrorPage(this);
		this.app = app ?? document.body;

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
		return new Promise((resolve) => {
			const check = () => {
				if ((window as any).google?.accounts?.id) {
					resolve();
				} else {
					console.warn("Waiting for google script to load...");
					setTimeout(check, 100);
				}
			};
			check();
		});
	}

	private async setup_google() {
		await this.wait_for_google();

		google.accounts.id.initialize({
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
				this.loggedin = false;
			}
		} catch (err) {
			console.error("Failed to check session:", err);
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
			if (history.length > 1)
				history.back();
			else
				this.route("/");
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
		if (real_path != path && route.type != "wild") {
			if (real_path.indexOf("?") != -1 && this.root_without_wild(real_path) != path)
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

	route_error(path: string, code: number, err_msg?: string) {
		this.currpage?.unload();
		window.scrollTo(0, 0);
		this.errpage.error_code = code;
		this.errpage.custom_msg = err_msg;
		this.errpage.load(this.app).then(() => this.errpage.init());
		this.currpage = this.errpage;
		this.errpage.error_code = 404;
		this.errpage.custom_msg = undefined;
		history.pushState({ route: path }, '', path);
	}

	async route(path: string, push: boolean = true) {
		let real_path = path;
		path = this.root_without_wild(path);
		const route = this.routes.get(path);
		if (this.bad_route(real_path, path, route)) {
			this.route_error(real_path, 404);
			return ;
		}
		this.check_session().then(async () => {
			if (!this.loggedin && route?.auth) {
				if (!this.currpage)
					await this.route(route.type == "overlay" ? route.back_url : "/", push);
				this.route("/login", push);
				return ;
			}
			if (!this.currpage && route?.type == "overlay") {
				await this.route(route.back_url, push);
				this.route(real_path, push);
				return ;
			}
			this.currpage?.unload();
			if (route && route.type != "overlay")
				window.scrollTo(0, 0);
			if (!route) {
				console.log(window.location.pathname, window.location.href, real_path, path);
				this.errpage.load(this.app).then(() => this.errpage.init());
				this.currpage = this.errpage;
			} else {
				this.currpage = route.page;
				this.currpage && (this.currpage.real_path = real_path);
				this.currpage?.load(this.app).then(() => this.currpage?.init());
			}
			if (push)
				history.pushState({ route: real_path }, '', real_path);
		});
	}

	async start() {
		await this.setup_google();
		this.route(location.pathname);
	}
}