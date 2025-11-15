import { HTTP_CODES, DefaultErrorPage } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";

export default class ErrorHandler extends DefaultErrorPage {
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);

	async load(app: HTMLDivElement | HTMLElement) {
		const err_msg = `
			<div class="center text-center mt-50">
				<h1>${ this.custom_msg ? this.custom_msg : HTTP_CODES[this.error_code] }</h1>
				<h4>Error code ${ this.error_code }</h4>
			</div>`;
		app.innerHTML = this.navbar.get_html() + err_msg + this.footer.get_html();
	}

	async init() {
		this.navbar.init();
	}
}