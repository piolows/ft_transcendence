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
	private winner_: string | null;

	constructor (players: Array<string> = []) {
		this.players_ = players;
		this.status_ = "not ongoing";
		this.matches_ = [];
		this.round_ = 1;
		this.currentMatchIndex_ = 0;
		this.winner_ = null;
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

	public get currentMatch(): Match {
		return this.matches_[this.currentMatchIndex_];
	}

	public get currentRound() {
		return this.round_;
	}

	public get winner(): string | null {
		return this.winner_;
	}

	// Save tournament state to local storage
	private saveToLocalStorage(): void {
		const tournamentData = {
			players_: this.players_,
			status_: this.status_,
			matches_: this.matches_,
			round_: this.round_,
			currentMatchIndex_: this.currentMatchIndex_,
			winner_: this.winner_
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
			tournament.winner_ = parsed.winner_;
			return tournament;
		} catch (e) {
			return null;
		}
	}



	private advanceToNextRound(): void {
		const currentRoundMatches = this.matches_.filter(m => m.round === this.round_);
		const winners = currentRoundMatches.map(m => m.winner as string);

		// Check if tournament is complete
		if (winners.length === 1) {
			this.status_ = "completed";
			this.winner_ = winners[0];
			console.log(`${this.winner} wins`)
			this.saveToLocalStorage();
			return;
		}

		// Create next round matches
		this.round_++;
		const nextRoundStartId = this.matches_.length;
		
		for (let i = 0; i < winners.length / 2; i++) {
			this.matches_.push({
				id: nextRoundStartId + i,
				round: this.round_,
				player1: winners[i * 2],
				player2: winners[i * 2 + 1],
				winner: null
			});
		}
		this.saveToLocalStorage();
	}

	public recordMatch(player1: string, player2: string, winner: string) {
		const match = this.currentMatch;
		console.log(match);
		if (!match) {
			throw new Error("No current match to record winner for");
		}

		if (winner !== match.player1 && winner !== match.player2) {
			throw new Error("Winner must be one of the players in the match");
		}

		match.winner = winner;
		this.currentMatchIndex_++;

		// Check if round is complete
		const roundMatches = this.matches_.filter(m => m.round === this.round_);
		const allRoundMatchesComplete = roundMatches.every(m => m.winner !== null);

		if (allRoundMatchesComplete) {
			console.log("creating next bracket");
			this.advanceToNextRound();
		}

		this.saveToLocalStorage();
	}

	public clearTournament() {
		localStorage.removeItem("tournament");
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
				round: this.round_,
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
	// private tournament: Tournament | null = null;
	private tournament: Tournament | null = null;

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		const title = document.createElement("h1");
		title.className = "text-4xl font-bold text-center mb-12 retro-shadow pt-16";
		title.innerText = "TOURNAMENT";
		app.appendChild(title);
		const main_container = document.createElement("div");
		main_container.className = "container flex justify-center align-center mx-auto pixel-box px-4 w-[80%]";
		main_container.id = "main-container";
		app.appendChild(main_container);
		const info = document.createElement("div");
		info.id = "matches-info";
		main_container.appendChild(info);
	}

	private startGames() {
		console.log("starting match: ", this.tournament?.currentMatch);
		// redirect to game page with tournament flag as true
		this.router.route(`/pong/game?tournament=true`);
	}

	async init() {
		await this.navbar.init();
		const app = document.getElementById("app") as HTMLDivElement;
		this.tournament = Tournament.loadFromLocalStorage();
		console.log(`winner ${this.tournament?.winner}`);
		if (this.tournament?.winner !== null) {
			const winnerOverlay = document.createElement("div");
			const blackScreen = document.createElement("div");
			const winnerText = document.createElement("p");
			const info_box = document.createElement("div");
			winnerText.innerText = `${this.tournament?.winner} has won!`;
			winnerOverlay.className = "fixed inset-0 z-50 flex items-center justify-center";
			blackScreen.className = "absolute inset-0 bg-black opacity-80";
			app.appendChild(winnerOverlay);
			app.appendChild(blackScreen);
			info_box.className = "pixel-box flex flex-col bg-purple-500 mx-auto";
			info_box.id = "winner-info";
			info_box.innerText = `${this.tournament?.winner} has won!`;
			winnerOverlay.appendChild(info_box);
			const back_button = document.createElement("button");
			back_button.id = "back";
			back_button.className = "pixel-box clicky bg-green-500";
			back_button.innerText = "BACK TO MENU"
			back_button.onclick = () => {
				// delete thr tournament
				this.tournament?.clearTournament();
				this.router.route("/");
			}
			info_box.appendChild(back_button);
		}
		const round: number = this.tournament?.currentRound as number;
		if (this.tournament === null)
			await this.router.route_error(this.real_path, 404, " No tournament found. Please create a tournament first.");
		if (this.tournament?.status !== "ongoing") this.tournament?.startTournament();
		const info_container = document.getElementById("matches-info") as HTMLDivElement;
		for (let i = 0; i < this.tournament!.matches.length; i++) {
			const match = this.tournament!.matches[i];
			if (match.round !== round) continue;
			const pairing_container = document.createElement("div");
			const p = document.createElement("p");
			p.innerText = `${this.tournament?.matches[i].player1} vs ${this.tournament?.matches[i].player2}`;
			info_container.appendChild(p);
			if (this.tournament?.matches[i].winner !== null) {
				const result = document.createElement("span");
				result.innerText = ` - Winner: ${this.tournament?.matches[i].winner}`;
				p.appendChild(result);
			}
		}
		const start = document.createElement("button");
		start.id = "start-match";
		start.innerText = "Start Match";
		start.className = "pixel-box bg-green-500 px-8 py-4 text-white hover:bg-green-600 font-pixelify text-xl clicky";
		start.onclick = () => {
			this.startGames();
		}
		info_container.appendChild(start);
	}

	unload() {

	}
}