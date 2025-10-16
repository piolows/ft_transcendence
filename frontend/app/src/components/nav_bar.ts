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
		return `
		<!-- nav bar -->
		<nav class="relative z-10 p-4">
			<div class="container mx-auto flex justify-between items-center">
				<!-- logo -->
				<div class="flex items-center space-x-2">
					<a href="/" router-link>
						<h1 class="text-4xl font-bold pixel-box bg-opacity-50 p-4">${ this.site_title }</h1>
					</a>
				</div>
				<!-- auth -->
				${ this.log_sect.get_html() }
			</div>
		</nav>`;
	}

	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}

	init() {
		this.log_sect.init();
	}
}


