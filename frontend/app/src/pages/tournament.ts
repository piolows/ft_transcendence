import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { HighlightSpanKind } from "typescript";
export interface Match {
	id: number;
	round: number;
	player1: string;
	player2: string;
	winner: string | null;
}
export class Tournament {
	private players_: Array<string>;
	private status_: string;
	private matches_: Array<Match>;
	private round_: number = 0;
	private currentMatchIndex_: number = 0;

	constructor (players: Array<string> = []) {
		this.players_ = players;
		this.status_ = "not ongoing";
		this.matches_ = [];
		this.round_ = 0;
		this.currentMatchIndex_ = 0;
	}

	public get players(): Array<string> {
		return this.players_;
	}

	public get status() {
		return this.status_;
	}

	public get matches(): Array<Match> {
		return this.matches_;
	}

	public get currentMatch() {
		return this.matches_[this.currentMatchIndex_];
	}

	// Save tournament state to local storage
	private saveToLocalStorage(): void {
		const tournamentData = {
			players_: this.players_,
			status_: this.status_,
			matches_: this.matches_,
			round_: this.round_,
			currentMatchIndex_: this.currentMatchIndex_
		};
		localStorage.setItem('tournament', JSON.stringify(tournamentData));
	}

	public static loadFromLocalStorage(): Tournament | null {
		const data = localStorage.getItem('tournament');
		if (!data) {
			return null;
		}

		try {
			const parsed = JSON.parse(data);
			const tournament = new Tournament(parsed.players_);
			tournament.status_ = parsed.status_;
			tournament.matches_ = parsed.matches_;
			tournament.round_ = parsed.round_;
			tournament.currentMatchIndex_ = parsed.currentMatchIndex_;
			return tournament;
		} catch (e) {
			return null;
		}
	}

	public startTournament() {
		// shuffle the players
		const shuffled = [...this.players_];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		// create a match for every pair of shuffled players
		for (let i = 0; i < 4; i++) {
			this.matches_.push({
				id: i,
				round: 1,
				player1: shuffled[i * 2],
				player2: shuffled[i * 2 + 1],
				winner: null
			});
		}
		this.status_ = "ongoing";
		this.round_ = 1;
		this.currentMatchIndex_ = 0;
		this.saveToLocalStorage();
	}
}

export class TournamentPage extends Component {
	private navbar = new NavBar(this.router);
	private tournament: Tournament | null = null;

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		const title = document.createElement("h1");
		title.className = "text-4xl font-bold text-center mb-12 retro-shadow pt-16";
		title.innerText = "MATCH FIXINGS";
		app.appendChild(title);
		const main_container = document.createElement("div");
		main_container.className = "container mx-auto px-4 pixel-box h-full";
		main_container.id = "main-container";
		app.appendChild(main_container);
		const info = document.createElement("div");
		info.id = "matches-info";
		main_container.appendChild(info);
	}

	private startGames() {
		console.log("starting match: ", this.tournament?.currentMatch);
	}

	async init() {
		await this.navbar.init();
		this.tournament = Tournament.loadFromLocalStorage();
		if (this.tournament === null)
			await this.router.route_error(this.real_path, 404, " No tournament found. Please create a tournament first.");
		if (this.tournament?.status !== "ongoing") this.tournament?.startTournament();
		const info_container = document.getElementById("matches-info") as HTMLDivElement;
		for (let i = 0; i < this.tournament!.matches.length; i++) {
			const p = document.createElement("p");
			p.innerText = `${this.tournament?.matches[i].player1} vs ${this.tournament?.matches[i].player2}`;
			info_container.appendChild(p);
		}
		this.startGames();
	}

	unload() {

	}
}