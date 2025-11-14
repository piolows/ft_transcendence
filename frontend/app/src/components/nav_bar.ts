import Component, { Router } from "../scripts/router";
import AuthSection from "./account";

export default class NavBar extends Component {
	site_title: string;
	log_sect: AuthSection;

	constructor(router: Router, site_title: string = "PONGOID") {
		super(router);
		this.site_title = site_title;
		this.log_sect = new AuthSection(this.router);
	}

	get_html() {
		const isHomepage = location.pathname === "/" || location.pathname === "";
		const backButton = !isHomepage ? `
			<button id="navbar_back_btn" class="pixel-box bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 font-pixelify transition-colors clicky">
				◄ BACK
			</button>
		` : '';
		return `
		<!-- nav bar -->
		<nav class="z-10 p-4 pr-8">
			<div class="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row justify-between items-center">
				<!-- logo and back button -->
				<div class="flex items-center space-x-4">
					<a href="/" router-link>
						<h1 class="text-4xl font-bold pixel-box bg-opacity-50 p-4">${ this.site_title }</h1>
					</a>
					${backButton}
				</div>
				<!-- auth -->
				${ this.log_sect.get_html() }
			</div>
		</nav>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}

	init() {
		this.log_sect.init();
		const backBtn = document.getElementById('navbar_back_btn');
		if (backBtn) {
			backBtn.onclick = () => this.router.route(this.back_url);
		}
	}
}


