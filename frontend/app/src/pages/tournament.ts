import Component from "../scripts/router";
import NavBar from "../components/nav_bar";

export default class Tournament extends Component {
	private navbar = new NavBar(this.router);
	// private players = localStorage.getItem("players");
	private players: Array<string> = [];

	private matchMake() {
		// this function will matchmake the players randomly
		console.log(`testing ${this.players}`);
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);

		
	}

	async init() {
		await this.navbar.init();
		const params = new URLSearchParams(window.location.search);
		if (!params.get("ongoing"))
			await this.router.route_error(this.real_path, 404);
		if (localStorage.getItem("ongoing") !== "true")
			await this.router.route_error(this.real_path, 400, "Tournament was never created :(");
		// match the players
		const playersItem = localStorage.getItem("players");
		if (playersItem !== null){
			this.players = JSON.parse(playersItem);
		}
		this.matchMake();
		// clear players at the end
		// localStorage.removeItem("players");
		// set the state to false
		// localStorage.removeItem("ongoing");
	}

	unload() {

	}
}