import Component, { Router, backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import Leaderboard from "../components/leaderboard";
import MainTitle from "../components/main_title";
import Menu from "../components/menu";
import MenuCard from "../components/menu_card";

export default class Homepage extends Component {
	private navbar = new NavBar(this.router);
	private title = new MainTitle(this.router);
	private leaderboard = new Leaderboard(this.router);
	private footer = new Footer(this.router);
	private menu = new Menu(this.router, "CHOOSE YOUR BATTLE");
	
	constructor(router: Router) {
		super(router);
		
		let card = new MenuCard(this.router, "ROSHAMBO", "CHALLENGE OTHERS TO A GAME OF ROCK-PAPER-SCISSORS", "yellow");
		card.add_button("PLAY", "/roshambo");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "TOURNAMENTS", "FIGHT IN BRACKET-STYLE TOURNAMENTS AND CROWN THE ULTIMATE WINNER", "pink");
		card.add_button("LIST", "/tournaments");
		card.add_button("CREATE", "/tournaments/create");
		card.add_button("JOIN", "/tournaments/join");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "PONG GAME", "PLAY THE RECREATION OF THE 1972 CLASSIC PONG GAME", "green");
		card.add_button("PLAY", "/pong");
		this.menu.add_card(card);
	}

	load(app: HTMLDivElement | HTMLElement) {
		this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto px-4\">" + this.title.get_html() + this.menu.get_html()
			+ this.leaderboard.get_html() + "</div>" + this.footer.get_html();
	}

	init() {
		this.navbar.init();
	}
}
