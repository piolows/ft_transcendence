import Webpage from "../scripts/router";
import footer from "../components/footer";
import navbar from "../components/nav_bar";

export default class ErrorHandler implements Webpage {
	private error_code = "404";

	set_status(status: string) {
		this.error_code = status;
	}

	load(app: HTMLDivElement | HTMLElement) {
		const err_msg = `
			<div class="center text-center mt-50">
				<h1>Unexpected Error</h1>
				<h4>Error code ${this.error_code}</h4>
			</div>`;

		app.innerHTML = navbar() + err_msg + footer();
	}
}