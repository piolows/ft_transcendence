import Component, { Router, backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import Menu from "../components/menu";
import MenuCard from "../components/menu_card";

export default class PongMenu extends Component {
	private navbar = new NavBar(this.router);
	private footer = new Footer(this.router);
	private menu = new Menu(this.router, "PONG GAMEMODES");
	
	constructor(router: Router) {
		super(router);

		let card = new MenuCard(this.router, "PLAY ONLINE", "Battle players worldwide in ranked matches!", "green");
		card.add_button("QUEUE NOW", "/pong/game");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "PLAY LOCALLY", "Play against a bot or against a player on the same keyboard!", "yellow");
		card.add_button("VS BOT", "/pong/difficulty");
		card.add_button("VS PLAYER", "/pong/game");
		this.menu.add_card(card);
	}

	load(app: HTMLDivElement | HTMLElement) {
		this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto px-4\">" + this.menu.get_html() + "</div>" + this.footer.get_html();
	}

	init() {
		this.navbar.init();
	}
}
