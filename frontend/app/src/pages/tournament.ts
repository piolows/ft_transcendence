import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { HighlightSpanKind } from "typescript";
import { TournamentPlayer } from "./tournament_init";
import Footer from "../components/footer";

export interface Match {
	id: number;
	round: number;
	player1: TournamentPlayer;
	player2: TournamentPlayer;
	winner: TournamentPlayer | null;
}
export class Tournament {
	private players_: Array<TournamentPlayer> = [];
	private status_: string = "not ongoing";
	private matches_: Array<Match> = [];
	private round_: number = 0;
	private currentMatchIndex_: number = 0;
	private winner_: string | null = null;

	constructor (players: Array<TournamentPlayer> = []) {
		this.players_ = players;
		this.status_ = "not ongoing";
		this.matches_ = [];
		this.round_ = 1;
		this.currentMatchIndex_ = 0;
		this.winner_ = null;
	}

	public get players(): Array<TournamentPlayer> {
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

	public get currentMatchIndex(): number {
		return this.currentMatchIndex_;
	}

	// Save tournament state to local storage
	private saveToLocalStorage(game?: string): void {
		const tournamentData = {
			players_: this.players_,
			status_: this.status_,
			matches_: this.matches_,
			round_: this.round_,
			currentMatchIndex_: this.currentMatchIndex_,
			winner_: this.winner_
		};
		sessionStorage.setItem(game && game === 'tictactoe' ? 'tictactoe-tournament' : 'tournament', JSON.stringify(tournamentData));
	}

	public static loadFromLocalStorage(game?: string): Tournament | null {
		const data = sessionStorage.getItem(game && game === "tictactoe" ? "tictactoe-tournament" : "tournament");
		if (!data) {
			return null;
		}

		try {
			const parsed = JSON.parse(data);
			const tournament = new Tournament(parsed.players_ as Array<TournamentPlayer>);
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

	private advanceToNextRound(game?: string): void {
		const currentRoundMatches = this.matches_.filter(m => m.round === this.round_);	
		const winners: Array<TournamentPlayer> = [];
		for (const match of currentRoundMatches) {
			console.log("match: ", match);
			if (match.winner !== null) {
				winners.push({name: match.winner.name, isBot: match.winner.isBot} );
			}
		}
		console.log("winners: ", winners);

		// Check if tournament is complete
		if (winners.length === 1) {
			this.status_ = "completed";
			this.winner_ = winners[0].name;
			console.log(`${this.winner} wins`)
			this.saveToLocalStorage(game);
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
		this.saveToLocalStorage(game);
	}

	public recordMatch(player1: TournamentPlayer, player2: TournamentPlayer, winner: TournamentPlayer, game?: string) {
		const match = this.currentMatch;
		console.log(match);
		if (!match) {
			throw new Error("No current match to record winner for");
		}

		console.log(winner);

		match.winner = winner;
		this.currentMatchIndex_++;

		// Check if round is complete
		const roundMatches = this.matches_.filter(m => m.round === this.round_);
		const allRoundMatchesComplete = roundMatches.every(m => m.winner !== null);

		if (allRoundMatchesComplete) {
			console.log("advancing to next round");
			this.advanceToNextRound(game);
		}

		this.saveToLocalStorage(game);
	}

	public clearTournament(game: string) {
		sessionStorage.removeItem(game === "tictactoe" ? "tictactoe-tournament" : "tournament");
	}

	public startTournament(game?: string) {
		// shuffle the players
		const shuffled = [...this.players_];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		// create a match for every pair of shuffled players
		for (let i = 0; i < this.players.length / 2; i++) {
			this.matches_.push({
				id: i,
				round: this.round_,
				player1: shuffled[i * 2],
				player2: shuffled[i * 2 + 1],
				winner: null
			});
		}
		for (const match of this.matches) {
			console.log("Pushed: ", match);
		}
		this.status_ = "ongoing";
		this.round_ = 1;
		this.currentMatchIndex_ = 0;
		this.saveToLocalStorage(game);
	}
}

export class TournamentPage extends Component {
	private navbar = new NavBar(this.router);
	private tournament: Tournament | null = null;
	private game: string | null = null;
	private footer = new Footer(this.router);

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		const title = document.createElement("h1");
		title.className = "text-4xl font-bold text-center mb-12 retro-shadow pt-16";
		title.innerText = "TOURNAMENT";
		app.appendChild(title);
		const main_container = document.createElement("div");
		main_container.className = "container flex justify-center align-center mx-auto px-4 w-[80%]";
		main_container.id = "main-container";
		app.appendChild(main_container);
		const info = document.createElement("div");
		info.id = "matches-info";
		main_container.appendChild(info);
		app.innerHTML += this.footer.get_html();
	}

	private startGames() {
		// redirect to game page with tournament flag as true
		if (this.game === "tictactoe") this.router.route("/tictactoe?tournament=true");
		else this.router.route(`/pong/game?tournament=true`);
	}

	async init() {
		await this.navbar.init();
		const params = new URLSearchParams(window.location.search);
		this.game = params.get("game");
		console.log(this.game);
		const app = document.getElementById("app") as HTMLDivElement;
		this.tournament = Tournament.loadFromLocalStorage(this.game as string);
		if (this.tournament?.winner !== null) {
			const winnerOverlay = document.createElement("div");
			winnerOverlay.className = "fixed inset-0 z-50 flex items-center justify-center";
			
			const blackScreen = document.createElement("div");
			blackScreen.className = "absolute inset-0 bg-black opacity-80";
			winnerOverlay.appendChild(blackScreen);
			
			const info_box = document.createElement("div");
			info_box.className = "pixel-box relative z-10 bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 max-w-md mx-4 text-center";
			
			const trophy = document.createElement("div");
			trophy.className = "text-6xl mb-4 animate-bounce";
			trophy.innerText = "🏆";
			info_box.appendChild(trophy);
			
			const winnerText = document.createElement("h2");
			winnerText.className = "text-3xl font-bold mb-4 text-white retro-shadow";
			winnerText.innerText = `${this.tournament?.winner} WINS!`;
			info_box.appendChild(winnerText);
			
			const congratsText = document.createElement("p");
			congratsText.className = "text-lg mb-6 text-white";
			congratsText.innerText = `Congratulations ${this.tournament?.winner}!`;
			info_box.appendChild(congratsText);
			
			const back_button = document.createElement("button");
			back_button.className = "pixel-box clicky bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-bold w-full";
			back_button.innerText = "BACK TO MENU";
			back_button.onclick = () => {
				this.tournament?.clearTournament(this.game as string);
				this.router.route("/");
			};
			info_box.appendChild(back_button);
        
			winnerOverlay.appendChild(info_box);
			app.appendChild(winnerOverlay);
	}
		const round: number = this.tournament?.currentRound as number;
		if (this.tournament === null)
			await this.router.route_error(this.real_path, 404, " No tournament found. Please create a tournament first.");
		if (this.tournament?.status !== "ongoing") this.tournament?.startTournament(this.game as string);
		const info_container = document.getElementById("matches-info") as HTMLDivElement;
		const matchesGrid = document.createElement("div");
    	matchesGrid.className = "grid gap-4 mb-8";
    
    for (let i = 0; i < this.tournament!.matches.length; i++) {
        const match = this.tournament!.matches[i];
        if (match.round !== round) continue;
        
        const matchCard = document.createElement("div");
        // matchCard.className = "pixel-box bg-gray-800 p-6 hover:bg-gray-700 transition-colors";
        matchCard.className = "pixel-box bg-gradient-to-br from-purple-900 via-blue-900 to-black p-6 hover:bg-gray-700 transition-colors";
        
        const matchHeader = document.createElement("div");
        matchHeader.className = "text-sm text-gray-400 mb-3 text-center";
		// if the previous match has a winner and the upcoming match does not have a winner yet
		if (i === this.tournament!.currentMatchIndex && match.winner === null) {
			matchHeader.className = "text-sm rainbow mb-3 text-center";
        	matchHeader.innerText = `Match ${match.id + 1} - UPCOMING`;
		} else {
			matchHeader.className = "text-sm text-blue-200 mb-3 text-center";
			matchHeader.innerText = match.winner === null ? `Match ${match.id + 1}` : `Match ${match.id + 1} - ${match.winner.name} won!`;
		}
        matchCard.appendChild(matchHeader);
        
        const playersContainer = document.createElement("div");
        playersContainer.className = "flex items-center justify-between mb-4";
        
        const player1 = document.createElement("div");
        player1.className = `flex-1 text-center py-3 px-4 ${match.winner !== null && match.winner?.name === match.player1.name ? 'bg-green-500 text-white font-bold' : 'bg-purple-800 text-gray-300'}`;
        player1.innerText = match.player1.name;
        
        const vs = document.createElement("div");
        vs.className = "px-4 text-xl font-bold text-purple-400";
        vs.innerText = "VS";
        
        const player2 = document.createElement("div");
        player2.className = `flex-1 text-center  py-3 px-4 ${match.winner !== null && match.winner?.name === match.player2.name ? 'bg-green-500 text-white font-bold' : 'bg-blue-800 text-gray-300'}`;
        player2.innerText = match.player2.name;
        
        playersContainer.appendChild(player1);
        playersContainer.appendChild(vs);
        playersContainer.appendChild(player2);
        matchCard.appendChild(playersContainer);
        
        if (match.winner !== null) {
            const winnerBadge = document.createElement("div");
            winnerBadge.className = "text-center text-sm bg-green-600 text-white py-2 px-4 rounded";
            winnerBadge.innerText = `✓ Winner: ${match.winner.name}`;
            matchCard.appendChild(winnerBadge);
        }
        
        matchesGrid.appendChild(matchCard);
    }
		const start = document.createElement("button");
		start.id = "start-match";
		start.innerText = "Start Match";
		start.className = "pixel-box bg-green-500 px-8 py-4 text-white hover:bg-green-600 text-xl clicky w-full";
    	start.onclick = () => {
        	this.startGames();
    	};
		info_container.appendChild(matchesGrid);
		info_container.appendChild(start);
	}

	unload() {
		const app = document.getElementById("app") as HTMLDivElement;
		app.querySelector("#main-container")?.remove();
	}
}