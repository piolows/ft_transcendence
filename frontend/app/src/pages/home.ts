import Component, { Router } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import TopPlayers from "../components/top_players";
import MainTitle from "../components/main_title";
import Menu from "../components/menu";
import MenuCard from "../components/menu_card";
import { _ } from "@faker-js/faker/dist/airline-DF6RqYmq";

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
		this.menu.add_card(card);

		card = new MenuCard(this.router, "TOURNAMENTS", "FIGHT IN A BRACKET-STYLE TOURNAMENT AND BE CROWNED THE ULTIMATE WINNER", "pink");
		card.add_button("PONG", "/tournament/create?game=pong", "create-pong-tournament");
		card.add_button("TICTACTOE", "/tournament/create?game=tictactoe", "create-tictactoe-tournament");
		this.menu.add_card(card);
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += "<div class=\"container mx-auto px-4\">" + this.title.get_html() + this.menu.get_html()
			+ this.topPlayers.get_html() + "</div>" + this.footer.get_html();
	}

	async init() {
		this.navbar.init();
		// if a pong tournamnent exists, add a button next to it to go back to the tournament page
		if (sessionStorage.getItem("tournament") !== null) {
			const create_pong_tournament = document.getElementById("create-pong-tournament")?.parentElement;
			if (create_pong_tournament) {
				const href = document.createElement("a");
				href.href = "/tournament?game=pong";
				const back_to_tournament = document.createElement("button");
				back_to_tournament.id = "pong-tournament";
				back_to_tournament.textContent = "RESUME PONG";
				back_to_tournament.className = "bg-pink-500 text-white px-6 py-3 rounded clicky font-pixelify group-hover:animate-pulse";
				href.appendChild(back_to_tournament);
				create_pong_tournament.after(href);
			}
		}
		if (sessionStorage.getItem("tictactoe-tournament") !== null) {
			const create_pong_tournament = document.getElementById("create-tictactoe-tournament")?.parentElement;
			if (create_pong_tournament) {
				const href = document.createElement("a");
				href.href = "/tournament?game=tictactoe";
				const back_to_tournament = document.createElement("button");
				back_to_tournament.id = "pong-tournament";
				back_to_tournament.textContent = "RESUME TICTACTOE";
				back_to_tournament.className = "bg-pink-500 text-white px-6 py-3 rounded clicky font-pixelify group-hover:animate-pulse";
				href.appendChild(back_to_tournament);
				create_pong_tournament.after(href);
			}
		}
		this.topPlayers.init();
	}
}
