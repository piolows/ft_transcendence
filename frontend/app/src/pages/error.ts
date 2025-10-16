import Component, { Router, HTTP_CODES } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";

export default class ErrorHandler extends Component {
	private error_code = 404;
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);

	set_status(status: number) {
		this.error_code = status;
	}

	load(app: HTMLDivElement | HTMLElement) {
		const err_msg = `
			<div class="center text-center mt-50">
				<h1>${ HTTP_CODES[this.error_code] }</h1>
				<h4>Error code ${ this.error_code }</h4>
			</div>`;
		this.navbar.load(app);
		app.innerHTML += err_msg + this.footer.get_html();
	}

	init() {
		this.navbar.init();
	}
}