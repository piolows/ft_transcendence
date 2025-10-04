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

	constructor(app: HTMLDivElement | null, error_handler?: Webpage) {
		this.errpage = error_handler ?? new DefaultErrorPage();
		this.app = app ?? document.body;

		// Handle back/forward buttons
		window.onpopstate = (event) => {
			const path = event.state?.route || "/";
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

	private get_path() {
		return location.pathname;
	}

	add_route(route: string, page: Webpage) {
		this.routes.set(route, page);
	}

	route(path: string, push: boolean = false) {
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
	}
}