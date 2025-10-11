import Webpage, { Router, backend_url } from "../scripts/router";
import title from "../components/main_title";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import menu from "../components/menu";
import isGoogleSignedIn from "../components/signedInCheck";

export default class PongMenu implements Webpage {
	public router: Router;

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {
		let cards = [
			["VS Player", "Play against a human opponent locally on the same device.", "/pong?op=player"],
			["VS Bot", "Play against AI opponent and practice your pong skills.", "/pong/difficulty"],
		];
		app.innerHTML = navbar(this.router.is_logged_in()) + "<div class=\"container mx-auto mt-16 px-4\">" + title() + menu(cards) + "</div>" + footer();
	}

	init() {
		isGoogleSignedIn(this.router);
	}
}
