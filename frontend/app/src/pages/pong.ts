import Component from "../scripts/router";
import { Player, Ball, Bot, Paddle, start_game } from "../scripts/game";
import NavBar from "../components/nav_bar";

export default class Pong extends Component {
	private end_game: () => void = () => {};
	private navbar = new NavBar(this.router);

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += `
			<div id="p1_score" class="hidden">0</div>
			<div id="p2_score" class="hidden">0</div>
			<div class="flex justify-center w-full" style="height: 500px;">
				<div id="gameInfo" class="flex flex-col pl-8 justify-center space-y-8 w-120">
					<div class="flex justify-left space-x-7">
						<button class="bg-blue-500 text-white py-3 pixel-box font-pixelify hover:bg-blue-600 clicky" id="back_btn" style="width: 100px;">BACK</button>
					</div>
					<div class="flex justify-left space-x-7">
						<div id="timer" class="my-auto text-white">
							<label>Timer: </label><label id="minutes">00</label>:<label id="seconds">00</label>
						</div>
					</div>
					<div class="flex justify-left space-x-7">
						<label>Game Mode: </label>
						<label id="gamemode"></label>
					</div>
				</div>
				<div id="parent-container" class="flex justify-center">
					<canvas id="gameCanvas" width="800" height="600" style="background-color: black;"></canvas>
				</div>
				<div class="w-120"><!-- Spacer to balance layout --></div>
			</div>`;
	}

	init() {
		this.navbar.init();
		const backbtn = document.getElementById('back_btn')!;
		backbtn.onclick = () => {
			if (history.length > 1) {
				history.back();
			}
			else {
				this.router.route("/");
			}
		};

		const ball_speed = 8;
		const ball_radius = 16;
		const paddle_speed = 8;
		const params = new URLSearchParams(window.location.search);
		const op = params.get("op");
		const difficulty = parseInt(params.get("difficulty") ?? "1");
		
		const gamemodeLabel = document.getElementById('gamemode')!;
		if (op === "bot") {
			const difficultyNames = ["EASY", "HARD", "EXTREME"];
			gamemodeLabel.textContent = `VS BOT (${difficultyNames[difficulty]})`;
		} else {
			gamemodeLabel.textContent = "VS PLAYER";
		}

		const cv = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const context = cv.getContext('2d')!;
		context.fillStyle = 'black';
		context.fillRect(0, 0, cv.width, cv.height);
		const p1_score = document.getElementById("p1_score")! as HTMLDivElement;
		const p2_score = document.getElementById("p2_score")! as HTMLDivElement;
		const timer = document.getElementById('timer')! as HTMLDivElement;
		const ball = new Ball(cv.width / 2, cv.height / 2, ball_speed, ball_radius, 'white');
		const left_paddle = new Paddle(90, 20, 20, (cv.height - 90) / 2, paddle_speed, 'orange');
		const right_paddle = new Paddle(90, 20, cv.width - (20 * 2), (cv.height - 90) / 2, paddle_speed, 'red');
		const player1 = new Player("Player 1", left_paddle);
		const player2 = (op == "bot") ? new Bot("AI Bot", right_paddle, cv, difficulty) : new Player("Player 2", right_paddle);

		this.end_game = start_game(cv, ball, player1, player2, p1_score, p2_score, timer);
	}

	unload() {
		this.end_game();
	}
}