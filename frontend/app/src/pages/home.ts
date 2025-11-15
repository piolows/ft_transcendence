import Component, { Router, backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import TopPlayers from "../components/top_players";
import MainTitle from "../components/main_title";
import Menu from "../components/menu";
import MenuCard from "../components/menu_card";

export default class Homepage extends Component {
	private navbar = new NavBar(this.router);
	private title = new MainTitle(this.router);
	private topPlayers = new TopPlayers(this.router);
	private footer = new Footer(this.router);
	private menu = new Menu(this.router, "CHOOSE YOUR BATTLE");

	constructor(router: Router) {
		super(router);
		
		let card;

		card = new MenuCard(this.router, "PONG GAME", "PLAY THE RECREATION OF THE 1972 CLASSIC PONG GAME", "green");
		card.add_button("PLAY", "/pong/menu");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "ROSHAMBO", "CHALLENGE OTHERS TO A GAME OF ROCK-PAPER-SCISSORS", "yellow");
		card.add_button("PLAY", "/roshambo");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "TOURNAMENTS", "FIGHT IN BRACKET-STYLE TOURNAMENTS AND CROWN THE ULTIMATE WINNER", "pink");
		card.add_button("LIST", "/tournaments/list");
		card.add_button("CREATE", "/tournaments/create");
		this.menu.add_card(card);
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto px-4\">" + this.title.get_html() + this.menu.get_html()
			+ this.topPlayers.get_html() + "</div>" + this.footer.get_html();
	}

	async init() {
		this.navbar.init();
		this.topPlayers.init();
	}
}
