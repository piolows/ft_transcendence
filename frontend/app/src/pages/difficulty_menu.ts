import Component, { Router, backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import Menu from "../components/menu";

export default class DifficultyMenu extends Component {
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);
	private menu = new Menu(this.router, "CHOOSE A DIFFICULTY");
	
	constructor(router: Router) {
		super(router);
		this.menu.new_card("Easy", "Challenge the AI bot on Easy difficulty", "blue");
		this.menu.new_card("Hard", "Challenge the AI bot on Hard difficulty", "blue");
		this.menu.new_card("Extreme", "Challenge the AI bot on Extreme difficulty", "blue");
	}

	load(app: HTMLDivElement | HTMLElement) {
		this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto mt-16 px-4\">" + this.menu.get_html() + "</div>" + this.footer.get_html();
	}

	init() {
		this.navbar.init();
	}
}
