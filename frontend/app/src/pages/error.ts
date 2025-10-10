import { Router, backend_url } from "../scripts/router";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import Webpage from "../scripts/router";
import isGoogleSignedIn from "../components/google";

export default class ErrorHandler implements Webpage {
	private error_code = "404";
	private router: Router;
	
	constructor(router: Router) {
		this.router = router;
	}

	set_status(status: string) {
		this.error_code = status;
	}

	load(app: HTMLDivElement | HTMLElement) {
		const err_msg = `
			<div class="center text-center mt-50">
				<h1>Unexpected Error</h1>
				<h4>Error code ${this.error_code}</h4>
			</div>`;

		app.innerHTML = navbar(this.router.is_logged_in()) + err_msg + footer();
	}

	init() {
		isGoogleSignedIn(this.router);
	}
}