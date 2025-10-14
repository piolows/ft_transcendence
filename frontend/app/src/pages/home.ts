import Webpage, { Router, backend_url } from "../scripts/router";
import title from "../components/main_title";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import menu from "../components/menu";
import leaderboard from "../components/leaderboard";
import isGoogleSignedIn from "../components/google";

export default class Homepage implements Webpage {
	private router: Router;

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {
		let cards = [
			["Roshambo Game", "Challenge your opponent in a 1 on 1 game of Rock, Paper, Scissors.", "yellow"],
			["Tournaments", "Compete for the top spot in a multiple-round elimination-style tournament!", "pink"],
			["Pong Game", "Play the recreation of the classic pong game from 1985.", "green", [
				["game", "/game"],
				["menu", "/pong/menu"]
			]]
		];

		app.innerHTML = navbar(this.router.is_logged_in()) + "<div class=\"container mx-auto px-4\">"
			+ title() + menu(cards, "CHOOSE YOUR BATTLE")
			+ leaderboard() + "</div>" + footer();
	}

	init() {
		isGoogleSignedIn(this.router);
		const login_btn = document.getElementById("login-button")! as HTMLButtonElement;
		login_btn.onclick = () => {
			this.router.route("/login", true);
		}
		const signup_btn = document.getElementById("signup-button")! as HTMLButtonElement;
		signup_btn.onclick = () => {
			this.router.route("/register", true);
		}
	}
}
