import Component, { Router, backend_url, sockets_url } from "../scripts/router";
import { Player, Ball, Bot, Paddle, start_game } from "../scripts/game";
import NavBar from "../components/nav_bar";

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
								<button id="overlay-button" class="pixel-box bg-green-500 px-8 py-4 text-white hover:bg-green-600 font-pixelify text-xl clicky">
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
			if (history.length > 2) {
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
							<img id="pfp" src="${backend_url + this.router.login_info.avatarURL}" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
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
					console.error("Failed to destroy room:", err);
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
					console.error("Failed to log out:", err);
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
		const difficulty = parseInt(params.get("difficulty") ?? "1");
		
		// const gamemodeLabel = document.getElementById('gamemode')!;
		const modeDisplay = document.getElementById('mode-display')!;
		const rcontrols = document.getElementById('right-controls')!;
		const diffbox = document.getElementById('difficulty-box')!;
		const difftext = document.getElementById('difficulty')!;
		if (op === "bot") {
			const difficultyNames = ["EASY", "HARD", "EXTREME"];
			modeDisplay.textContent = 'VS BOT';
			difftext.textContent = difficultyNames[difficulty];
			diffbox.style.display = 'block';
			rcontrols.style.display = 'none';
		} else {
			modeDisplay.textContent = "VS PLAYER";
			diffbox.style.display = 'none';
			rcontrols.style.display = 'block';
		}

		const cv = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const context = cv.getContext('2d')!;
		const p1_score = document.getElementById("p1_score")! as HTMLDivElement;
		const p2_score = document.getElementById("p2_score")! as HTMLDivElement;
		const timer = document.getElementById('timer')! as HTMLDivElement;
		const ball = new Ball(cv.width / 2, cv.height / 2, ball_speed, ball_radius, 'white');
		const left_paddle = new Paddle(paddle_height, paddle_width, paddle_width, (cv.height - paddle_height) / 2, paddle_speed, 'orange');
		const right_paddle = new Paddle(paddle_height, paddle_width, cv.width - (paddle_width * 2), (cv.height - paddle_height) / 2, paddle_speed, 'red');
		const player1 = new Player("Player 1", left_paddle);
		const player2 = (op == "bot") ? new Bot("AI Bot", right_paddle, cv, difficulty) : new Player("Player 2", right_paddle);

		// initial overlay
		const overlay = document.getElementById('game-overlay')!;
		const overlayTitle = document.getElementById('overlay-title')!;
		const overlayMessage = document.getElementById('overlay-message')!;
		const overlayButton = document.getElementById('overlay-button')!;

		//  reset game state to initial values
		const resetGameState = () => {
			// reset scores and timer
			p1_score.textContent = '0';
			p2_score.textContent = '0';
			(timer.children[0] as HTMLElement).textContent = '00';
			(timer.children[2] as HTMLElement).textContent = '00';
			
			// reset positions
			ball.x = cv.width / 2;
			ball.y = cv.height / 2;
			ball.xVel = ball.speed;
			ball.yVel = ball.speed;
			ball.starting = true;
			ball.moving = false;
			ball.first_collision = false;
			
			left_paddle.yPos = (cv.height - paddle_height) / 2;
			left_paddle.up = false;
			left_paddle.down = false;
			right_paddle.yPos = (cv.height - paddle_height) / 2;
			right_paddle.up = false;
			right_paddle.down = false;
			
			// redraw canvas
			context.fillStyle = 'black';
			context.fillRect(0, 0, cv.width, cv.height);
		};

		// function to start/restart game
		const startNewGame = () => {
			resetGameState();
			overlay.style.display = 'none';
			this.end_game = start_game(cv, ball, player1, player2, p1_score, p2_score, timer, endOverlay);
		};

		// game end callback
		const endOverlay = (winner: string, p1Score: number, p2Score: number) => {
			overlay.style.display = 'flex';
			overlayTitle.textContent = winner === 'draw' ? 'DRAW!' : `${winner} WINS!`;
			overlayMessage.textContent = `Final Score: ${p1Score} - ${p2Score}`;
			overlayButton.textContent = 'REMATCH';
			overlayButton.onclick = startNewGame;
		};

		// start
		resetGameState();
		overlayButton.onclick = startNewGame;
	}

	unload() {
		this.end_game();
	}
}