export default interface Webpage {
	init?(): void;
	load(app: HTMLDivElement | HTMLElement): void;
	unload?(): void;
}

export var backend_url = "http://localhost:4161";

class DefaultErrorPage implements Webpage {
	load(app: HTMLDivElement | HTMLElement, err_code: string = "404") {
		app.innerHTML = `
			<div class="center text-center mt-50">
				<h1>Unexpected Error</h1>
				<h4>Error code ${err_code}</h4>
			</div>`;
	}
}

export class Router {
	private routes = new Map<string, Webpage>();
	private currpage: Webpage | null = null;
	private errpage: Webpage;
	private app: HTMLDivElement | HTMLElement;
	private loggedin = false;

	constructor(app: HTMLDivElement | null) {
		this.errpage = new DefaultErrorPage();
		this.app = app ?? document.body;

		// Handle back/forward buttons
		window.onpopstate = (event) => {
			const path = event.state?.route || "/";
			console.log(event.state.route);
			this.route(path, false);
		};

		// Intercept clicks on <a data-link>
		document.addEventListener("click", (e) => {
			const target = (e.target as HTMLElement).closest("a[data-link]") as HTMLAnchorElement | null;
			if (target) {
				e.preventDefault();
				this.route(target.getAttribute("href")!);
			}
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
	
	set_error_handler(error_handler: Webpage) {
		this.errpage = error_handler;
	}

	add_route(route: string, page: Webpage) {
		this.routes.set(route, page);
	}

	route(path: string, push: boolean = false) {
		this.check_session().then(() => {
			this.currpage?.unload?.();
			if (!this.routes.has(path)) {
				this.errpage.load(this.app);
				this.currpage = this.errpage;
			} else {
				this.currpage = this.routes.get(path) ?? null;
				this.currpage?.load(this.app);
				this.currpage?.init?.();
			}
			if (push)
				history.pushState({ route: path }, '', path);
		});
	}

	async check_session() {
		try {
			const res = await fetch(backend_url + "/auth/me", {
				credentials: "include", // VERY IMPORTANT! Sends cookies with request
			});
			const data = await res.json();

			if (data.loggedIn) {
				// const profile = document.getElementById('profile-info');
				// const pfp = document.getElementById('pfp') as HTMLImageElement;
				// const uname = document.getElementById('uname');
				// const umail = document.getElementById('umail');
				// profile && (profile.style.display = "block");
				// pfp && (pfp.src = data.user.avatarURL);
				// uname && (uname.innerText = data.user.username);
				// umail && (umail.innerText = data.user.email);
				// showLogoutButton(data.user);
				this.loggedin = true;
			} else {
				// showLoginButton();
				this.loggedin = false;
			}
		} catch (err) {
			console.error("Failed to check session:", err);
		}
	}

	is_logged_in(): boolean {
		return this.loggedin;
	}

	async start() {
		await this.setup_google();
		await this.check_session();
		this.route(location.pathname);
	}
}