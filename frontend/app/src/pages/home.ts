import Webpage, { Router, backend_url } from "../scripts/router";
import title from "../components/main_title";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import menu from "../components/menu";
import isGoogleSignedIn from "../components/google";

export default class Homepage implements Webpage {
	private router: Router;

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {
		let cards = [
			["Roshambo Game", "Challenge your opponent in a 1 on 1 game of Rock, Paper, Scissors."],
			["Tournaments", "Compete for the top spot in a multiple-round elimination-style tournament!"],
			["Pong Game", "Play the recreation of the classic pong game from 1985.", "/pong/menu"]
		];
		app.innerHTML = navbar(this.router.is_logged_in()) + "<div class=\"container mx-auto mt-16 px-4\">" + title() + menu(cards) + "</div>" + footer();
	}

	init() {
		isGoogleSignedIn(this.router);
	}
}
