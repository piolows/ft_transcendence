import Component, { Router, backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import Menu from "../components/menu";
import MenuCard from "../components/menu_card";

export default class DifficultyMenu extends Component {
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);
	private menu = new Menu(this.router, "CHOOSE A DIFFICULTY");
	
	constructor(router: Router) {
		super(router);
		this.back_url = "/pong/menu";
		this.navbar.back_url = "/pong/menu";

		let card = new MenuCard(this.router, "EASY", "Challenge the AI bot on Easy difficulty", "green");
		card.add_button("EASY PEASY", "/pong/game?op=bot&difficulty=0");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "HARD", "Challenge the AI bot on Hard difficulty", "yellow");
		card.add_button("EASY PEASY...?", "/pong/game?op=bot&difficulty=1");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "EXTREME", "Challenge the AI bot on Extreme difficulty", "red");
		card.add_button("NOT EASY PEASY", "/pong/game?op=bot&difficulty=2");
		this.menu.add_card(card);
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto px-4\">" + this.menu.get_html() + "</div>" + this.footer.get_html();
	}

	init() {
		this.navbar.init();
	}
}
