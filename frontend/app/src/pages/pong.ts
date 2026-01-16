import Component, { Router, backend_url, cdn_url, sockets_url } from "../scripts/router";
import { Player, Ball, Bot, Paddle, start_game } from "../scripts/game";
import NavBar from "../components/nav_bar";
import { Tournament } from "./tournament";
import { TournamentPlayer } from "./tournament_init";
export default class Pong extends Component {
	private end_game: () => void = () => {};
	private navbar = new NavBar(this.router);
		
	constructor(router: Router) {
		super(router);
		this.back_url = "/pong/menu";
		this.navbar.back_url = "/pong/menu";
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = `
			<div id="p1_score" hidden>0</div>
			<div id="p2_score" hidden>0</div>
			<div class="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
			<!-- navbar clone -->
			<div class="bg-blue-900 border-b-4 border-blue-700 px-4 py-3 z-10">
				<div class="grid grid-cols-3 items-center gap-4">
					<!-- logo + back button -->
					<div class="flex items-center space-x-4">
						<a href="/" router-link>
							<h1 class="text-4xl font-bold pixel-box bg-opacity-50 p-4 hover:opacity-80 transition-opacity cursor-pointer">PONGOID</h1>
						</a>
						<button id="back_btn" class="pixel-box bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 font-pixelify transition-colors clicky">
							<<
						</button>
					</div>
					<!-- timer -->
					<div class="pixel-box bg-blue-800 px-8 py-2 text-center mx-auto">
						<p class="text-xs text-cyan-300 font-pixelify">TIMER</p>
						<div id="timer" class="text-3xl font-bold text-white tracking-wider">
							<span id="minutes">00</span><span>:</span><span id="seconds">00</span>
						</div>
					</div>
					<!-- gamemode (disblaed temp) and user info -->
					<div class="flex items-center space-x-6 justify-end">
						<!-- div id="gamemode" class="pixel-box bg-blue-700 px-4 py-2 text-white font-pixelify text-sm">VS PLAYER</div -->
						<div id="user-section"></div>
					</div>
				</div>
			</div>
			
			<!-- main area -->
				<div class="flex-1 flex overflow-hidden">
					<!-- left sidebar -->
					<div class="w-72 bg-blue-900 border-r-2 border-blue-700 p-4 flex flex-col justify-between overflow-y-auto">
					<div class="space-y-4">
						<div class="pixel-box bg-blue-800 p-3 text-center">
							<p class="text-xs font-pixelify text-gray-300 mb-2">CONTROLS</p>
							<p class="text-xs text-white">W/S</p>
							<p class="text-xs text-white">to move</p>
						</div>
					</div>
						<a href="/pong/menu" router-link>
							<div class="pixel-box bg-blue-800 p-3 text-center text-xs">
								<p class="font-pixelify text-gray-300 mb-2">LOCAL MATCH</p>
								<p class="text-white">OFFLINE</p>
							</div>
						</a>
					</div>

					<!-- canvas -->
					<div class="flex-1 flex items-center justify-center bg-black relative">
						<canvas id="gameCanvas" width="800" height="600" style="background-color: black; border: 3px solid #1e40af;"></canvas>
						<!-- game overlay -->
						<div id="game-overlay" class="absolute flex items-center justify-center" style="width: 800px; height: 600px; background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(4px);">
							<div class="pixel-box bg-blue-900 p-8 text-center">
								<h2 id="overlay-title" class="text-3xl font-pixelify mb-6">READY TO PLAY?</h2>
								<p id="overlay-message" class="font-silkscreen text-lg mb-8 text-white"></p>
								<button id="overlay-button" class="pixel-box bg-green-500 px-8 py-4 text-white hover:bg-green-600 text-xl clicky">
									START GAME
								</button>
							</div>
						</div>
					</div>

					<!-- right sidebar -->
					<div class="w-72 bg-blue-900 border-l-2 border-blue-700 p-4 flex flex-col justify-between overflow-y-auto">
						<div id="right-controls" class="pixel-box bg-blue-800 p-3 text-center">
							<p class="text-xs font-pixelify text-gray-300 mb-2">CONTROLS</p>
							<p class="text-xs text-white">↑/↓</p>
							<p class="text-xs text-white">to move</p>
						</div>
						<a href="/pong/difficulty" id="difficulty-box" class="pixel-box bg-blue-800 p-3 text-center">
							<p class="text-xs font-pixelify text-gray-300 mb-2">DIFFICULTY</p>
							<p id="difficulty" class="text-xs text-white"></p>
						</a>
						<a href="/pong/menu" router-link>
							<div class="pixel-box bg-blue-800 p-3 text-center text-xs">
								<p class="font-pixelify text-gray-300 mb-2">GAME MODE</p>
								<p id="mode-display" class="text-white">LOCAL</p>
							</div>
						</a>
					</div>
				</div>
			</div>
		`;
	}

	async init() {
		// back
		const backbtn = document.getElementById('back_btn')!;
		backbtn.onclick = () => {
			if (this.router.last_path && history.length > this.router.history_len) {
				history.back();
			} else {
				this.router.route(this.back_url, "replace");
			}
		};

		// user info
		const userSection = document.getElementById('user-section')!;
		if (this.router.loggedin) {
			userSection.innerHTML = `
				<div class="flex items-center space-x-6">
					<a href="/profile" router-link class="hover:opacity-80 transition-opacity">
						<div class="flex items-center space-x-4">
							<img id="pfp" src="${cdn_url + this.router.login_info.avatarURL}" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
							<div>
								<h4 id="username" class="crt-text text-white text-sm">${this.router.login_info.username}</h4>
								<p id="email" class="text-xs font-silkscreen text-gray-300">${this.router.login_info.email}</p>
							</div>
						</div>
					</a>
					<button id="logout-button" class="pixel-box bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors clicky glitch">
						LOGOUT
					</button>
				</div>
			`;
			const logoutbtn = document.getElementById('logout-button')!;
			logoutbtn.onclick = async () => {
				try {
					await fetch(sockets_url + "/pong/destroy", {
						method: "POST",
						credentials: "include"
					});
				} catch (err) {
					console.error("Failed to destroy room");
				}
				try {
					await fetch(backend_url + "/auth/logout", {
						method: "POST",
						credentials: "include"
					});
					this.router.login_info = null;
					this.router.stop_presence_heartbeat();
					this.router.route("/");
				} catch (err) {
					console.error("Failed to log out");
				}
			};
		}

		const ball_speed = 8;
		const ball_radius = 16;
		const paddle_speed = 8;
		const paddle_height = 90;
		const paddle_width = 20;
		const params = new URLSearchParams(window.location.search);
		const op = params.get("op");
		const isTournament = params.get("tournament");
		const diff = params.get("difficulty");
		let difficulty = 1;
		if (diff && ["0", "1", "2"].includes(diff))
			difficulty = parseInt(diff);
		// const gamemodeLabel = document.getElementById('gamemode')!;
		const modeDisplay = document.getElementById('mode-display')!;
		const rcontrols = document.getElementById('right-controls')!;
		const diffbox = document.getElementById('difficulty-box')!;
		const difftext = document.getElementById('difficulty')!;
		const difficultyNames = ["EASY", "HARD", "EXTREME"];
		if (op === "bot") {
			modeDisplay.textContent = 'VS BOT';
			difftext.textContent = difficultyNames[difficulty];
			diffbox.style.display = 'block';
			rcontrols.style.display = 'none';
		} else {
			modeDisplay.textContent = "VS PLAYER";
			diffbox.style.display = 'none';
			rcontrols.style.display = 'block';
		}

		// overlay
		const overlay = document.getElementById('game-overlay')!;
		const overlayTitle = document.getElementById('overlay-title')!;
		const overlayMessage = document.getElementById('overlay-message')!;
		const overlayButton = document.getElementById('overlay-button')!;

		const cv = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const context = cv.getContext('2d')!;
		const p1_score = document.getElementById("p1_score")! as HTMLDivElement;
		const p2_score = document.getElementById("p2_score")! as HTMLDivElement;
		const timer = document.getElementById('timer')! as HTMLDivElement;
		const ball = new Ball(cv.width / 2, cv.height / 2, ball_speed, ball_radius, 'white');
		const left_paddle = new Paddle(paddle_height, paddle_width, paddle_width, (cv.height - paddle_height) / 2, paddle_speed, 'orange');
		const right_paddle = new Paddle(paddle_height, paddle_width, cv.width - (paddle_width * 2), (cv.height - paddle_height) / 2, paddle_speed, 'red');
		let player1: Player | Bot | null = null;
		let player2: Player | Bot | null = null;
		let tournament: Tournament | null = null;
		if (isTournament !== null && isTournament === "true") {
			const tournament_string = sessionStorage.getItem("tournament");
			if (tournament_string === null) {
				alert("No tournament found. Redirecting to menu.");
				this.router.route("/pong/menu");
				return;
			}
			// get the palyer values of the matchup
			tournament = Tournament.loadFromLocalStorage();
			const currentMatch = tournament?.currentMatch;
			player1 = currentMatch?.player1.isBot == true ? new Bot(currentMatch?.player1.name, left_paddle, cv, Math.floor(Math.random() * difficultyNames.length)) : new Player(currentMatch?.player1.name!, left_paddle);
			player2 = currentMatch?.player2.isBot == true ? new Bot(currentMatch?.player2.name, right_paddle, cv, Math.floor(Math.random() * difficultyNames.length)) : new Player(currentMatch?.player2.name!, right_paddle);
		} else {
			const p2Name = sessionStorage.getItem("p2Name");
			if (p2Name === null && op !== "bot" && isTournament !== "true") {
				// add an input box to the overlay if player name doesn't exist
				const form = document.createElement("form");
				// overlayMessage.appendChild(form);
				overlayButton.className += " hidden";
				overlayMessage.after(form);
				const p2NameInput = document.createElement("input");
				p2NameInput.id = "p2-name";
				p2NameInput.type = "text";
				overlayMessage.innerText = "Please enter Player 2's name";
				p2NameInput.className = "w-[50%] px-4 py-2 bg-black border-2 border-blue-500 text-white font-vt323";
				const submit = document.createElement("button");
				let name: string | null = null;
				submit.type = "submit";
				submit.innerText = "OK!";
				submit.className = "pixel-box bg-green-500 px-4 py-2 text-white hover:bg-green-600 ml-4 clicky";
				form.appendChild(p2NameInput);
				form.appendChild(submit);
				
				const errorMsg = document.createElement("p");
				form.appendChild(errorMsg);
				errorMsg.id = "name-error";
				errorMsg.className = "text-red-500 text-sm mt-2 font-silkscreen hidden";
				errorMsg.innerText = "Invalid name! Use only letters, numbers, dashes, and underscores.";
				submit.onclick = (e) => {
					e.preventDefault();
					name = p2NameInput.value
					// regex name to check
					const name_regex = /^[a-zA-Z0-9_-]+$/;
					if (name === "" || !name_regex.test(name)) {
						// alert("Please enter a valid name for Player 2!");
						errorMsg.classList.remove("hidden");
						p2NameInput.classList.remove("border-blue-500");
						p2NameInput.classList.add("border-red-500");
						p2NameInput.focus();
						return;
					}
					sessionStorage.setItem("p2Name", name);
					form.removeChild(submit);
					form.removeChild(p2NameInput);
    				form.removeChild(errorMsg);
					overlayMessage.innerText = `${this.router.login_info.username} VS ${name}!`;
					// player1 = new Player("Player 1", left_paddle);
					player1 = new Player(this.router.login_info.username, left_paddle);
					player2 = (op == "bot") ? new Bot("AI Bot", right_paddle, cv, difficulty) : new Player(name === null ? "" : name, right_paddle);
					overlayButton.className = overlayButton.className.replace(" hidden", "");
				};
			} else {
				if (op !== "bot" && isTournament !== "true")
					overlayMessage.innerText = `${this.router.login_info.username} VS ${p2Name}!`;
				// this.router.login_info.avatarURL
				player1 = new Player(this.router.login_info.username, left_paddle);
				player2 = (op == "bot") ? new Bot("AI Bot", right_paddle, cv, difficulty) : new Player(p2Name!, right_paddle);
			}
		}

		// game end callback
		const endOverlay = isTournament !== "true" ? (winner: string, p1Score: number, p2Score: number) => {
			overlay.style.display = 'flex';
			overlayTitle.textContent = winner === 'draw' ? 'DRAW!' : `${winner} WINS!`;
			overlayMessage.textContent = `Final Score: ${p1Score} - ${p2Score}`;
			overlayButton.textContent = 'REMATCH';
			if (op !== "bot" && isTournament !== "true") {
				const changeOp = overlayButton.cloneNode(true) as HTMLButtonElement;
				changeOp.onclick = () => {
					sessionStorage.removeItem("p2Name");
					window.location.reload();
				}
				changeOp.textContent = "NEW OP";
				overlayButton.after(changeOp);
			}
				
			overlayButton.onclick = () => window.location.reload();
		} : (winner: TournamentPlayer | string, p1Score: number, p2Score: number) => {
			overlay.style.display = 'flex';
			const match = tournament?.currentMatch;
			let trueWinner: TournamentPlayer | null = null;
			if (typeof winner === "string") {
				if (winner === "draw") {
					trueWinner = Math.random() < 0.5 ? { name: match?.player1.name, isBot: match?.player1.isBot } : { name: match?.player2.name, isBot: match?.player2.isBot };
					overlayTitle.textContent = `DRAW THEREFORE ${trueWinner.name} wins`;
				}
			} else overlayTitle.textContent = `${winner.name} WINS!`;
			overlayMessage.textContent = `Final Score: ${p1Score} - ${p2Score}`;
			overlayButton.textContent = 'BACK TO TOURNAMENT';
			overlayButton.onclick = () => {
				// tournament.reportMatchResult(player1!.name, player2!.name, winner === 'draw' ? null : winner);
				const currentMatch = tournament?.currentMatch;
				// tournament?.recordMatch(player1!.name, player2!.name, winner === 'draw' ? "none" : (winner === "AI Bot" ? "bot" : winner));
				tournament?.recordMatch(currentMatch?.player1!, currentMatch?.player2!, trueWinner !== null ? trueWinner : winner);
				this.router.route("/tournament");
			};
		};

		// start game button
		overlayButton.onclick = () => {
			overlay.style.display = 'none';
			this.end_game = start_game(cv, ball, player1!, player2!, p1_score, p2_score, timer, this.router, endOverlay);
		};
	}

	unload() {
		sessionStorage.removeItem("p2Name");
		this.end_game();
	}
}