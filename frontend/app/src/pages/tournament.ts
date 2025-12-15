import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { HighlightSpanKind } from "typescript";

export class Tournament {
	private players_: Array<string>;
	private status_: string;
	private matches_: Array<string>;
	private round_: number = 0;

	constructor (players: Array<string> = []) {
		console.log('constructor: the players are: ', players);
		this.players_ = players;
		this.status_ = "not ongoing";
		this.matches_ = [];
		this.round_ = 0;
	}

	public get players() {
		return this.players_;
	}

	public get status() {
		return this.status_;
	}
}

export class TournamentPage extends Component {
	private navbar = new NavBar(this.router);
	// private players = localStorage.getItem("players");
	private players: string[] = [];
	private tournament: Tournament | null = null;

	private matchMake() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));

			// Swap elements at i and j
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    	}
    	return this.players;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		
	}

	async init() {
		await this.navbar.init();
		const stored: string | null = localStorage.getItem("tournament");
		if (stored !== null)
			this.tournament = new Tournament(JSON.parse(stored));
		else
			await this.router.route_error(this.real_path, 404, "Tournament not found :(");
		console.log(this.tournament?.status);
		console.log(this.tournament?.players);
		// console.log("players: ", this.players);
	}

	unload() {

	}
}