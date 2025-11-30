import Component from "../scripts/router";
import NavBar from "../components/nav_bar";

export default class TournamentPage extends Component {
	private navbar = new NavBar(this.router);
	private players: Array<string> = [];

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += ``;
	}

	async init() {
		this.navbar.init();
	}
}
