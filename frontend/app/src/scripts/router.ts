export const HTTP_CODES: any = {
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Page Not Found",
	500: "Internal Server Error",
	503: "Service Unavailable",
}

export default abstract class Component {
	router: Router;

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {}
	init() {}
	unload() {}
}

export var backend_url = "https://localhost:4161";

class DefaultErrorPage extends Component {
	constructor(router: Router) {
		super(router);
	}
	
	load(app: HTMLDivElement | HTMLElement, err_code: string = "404") {
		app.innerHTML = `
			<div class="center text-center mt-50">
				<h1>${ HTTP_CODES[err_code] }</h1>
				<h4>Error code ${ err_code }</h4>
			</div>`;
	}
}

export class Router {
	private routes = new Map<string, Component>();
	private currpage: Component | null = null;
	private errpage: Component;
	app: HTMLDivElement | HTMLElement;
	login_info: any = null;
	loggedin = false;

	constructor(app: HTMLDivElement | null) {
		this.errpage = new DefaultErrorPage(this);
		this.app = app ?? document.body;

		// Handle back/forward buttons
		window.onpopstate = (event) => {
			const path = event.state?.route || "/";
			this.route(path);
		};

		// Intercept clicks on <a router-link>
		document.addEventListener("click", (e) => {
			const target = (e.target as HTMLElement).closest("a[router-link]") as HTMLAnchorElement | null;
			if (!target || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
				return;
			e.preventDefault();
			this.route(target.getAttribute("href")!, true);
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

		if (!window.handleCredentialResponse) {
			// Register callback
			window.handleCredentialResponse = (response) => {
				fetch(backend_url + "/auth/google-login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token: response.credential }),
					credentials: "include"
				})
				.then(res => res.json())
				.then(data => {
					this.login_info = data.user;
					this.route("/", true);
				})
				.catch(err => console.error("Error sending token to backend:", err));
			};
		}

		// Initialize the Google API manually
		google.accounts.id.initialize({
			client_id: "336093315647-mlq5ufc06999l3vhrvbimtn36jqvmgtk.apps.googleusercontent.com",
			callback: window.handleCredentialResponse,
			auto_select: false,
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

	set_error_handler(handler: Component) {
		this.errpage = handler;
	}

	add_route(route: string, page: Component) {
		this.routes.set(route, page);
	}

	route(path: string, push: boolean = false) {
		this.check_session().then(() => {
			if (path == "/login" || path == "/register") {
				if (this.loggedin || !this.currpage) {
					this.route("/", true);
					return ;
				}
			}
			window.scrollTo(0, 0);
			this.currpage?.unload();
			if (!this.routes.has(path)) {
				this.errpage.load(this.app);
				this.currpage = this.errpage;
			} else {
				this.currpage = this.routes.get(path) ?? null;
				this.currpage?.load(this.app);
				this.currpage?.init();
			}
			if (push)
				history.pushState({ route: path }, '', path);
		});
	}

	async start() {
		await this.setup_google();
		await this.check_session();
		this.route(location.pathname);
	}
}