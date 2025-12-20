import Component, { Router } from "../scripts/router";
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

		card = new MenuCard(this.router, "ULTIMATE TIC-TAC-TOE", "DO WHAT IT TAKES TO BECOME AN ULTIMATE TIC-TAC-TOE LEGEND", "yellow");
		card.add_button("PLAY", "/tictactoe");
		card.add_button("START TOURNAMENT", "/tictactoe/tournament");
		this.menu.add_card(card);

		card = new MenuCard(this.router, "PONG TOURNAMENT", "FIGHT IN A BRACKET-STYLE TOURNAMENT AND BE CROWNED THE ULTIMATE WINNER", "pink");
		card.add_button("START TOURNAMENT", "/tournament/create");
		this.menu.add_card(card);
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto px-4\">" + this.title.get_html() + this.menu.get_html()
			+ this.topPlayers.get_html() + "</div>" + this.footer.get_html();
	}

	async init() {
		this.navbar.init();
		if (sessionStorage.getItem("tournament") !== null) {
			const menuCards = document.querySelectorAll(".menu-card") as NodeListOf<HTMLDivElement>;
			let i = 0;
			for (;i < menuCards.length; i++) {
				const title = menuCards[i].querySelector("#card-title") as HTMLHeadElement;
				if (title.innerText === "TOURNAMENT") break ;
			}
			const href = document.createElement("a");
			href.href = "/tournament";
			const button = document.createElement("button");
			button.className = "bg-pink-500 text-white px-6 py-3 rounded clicky font-pixelify group-hover:animate-pulse";
			button.innerText = "GO TO TOURNAMENT";
			href.appendChild(button);
			menuCards[i].appendChild(href);
			// card.add_button("GO TO TOURNAMENT", "/tournament");
			// <button id=${ this.buttons[i][2] } class="${ colors[this.color][2] } text-white px-6 py-3 rounded clicky font-pixelify group-hover:animate-pulse">
			// 			${ this.buttons[i][0] }
			// 		</button>`;
		}
		this.topPlayers.init();
	}
}
