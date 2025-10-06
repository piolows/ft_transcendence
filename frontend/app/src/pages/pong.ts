import Webpage, { Router } from "../scripts/router";
import { Ball, Bot, Paddle, start_game } from "../scripts/game";

export default class Pong implements Webpage {
	private router: Router;
	private end_game: () => void = () => {};

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = `
			<button id="back-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-4 left-4">
				Back
			</button>
			<h1 class="text-4xl font-bold text-blue-500 underline italic text-center mb-5">Pongoid</h1>
			<div id="p1_score" class="hidden">0</div>
			<div id="p2_score" class="hidden">0</div>
			<div id="parent-container" class="flex justify-center">
				<canvas id="gameCanvas" width="800" height="600"></canvas>
			</div>`;
	}

	init() {
		const backbtn = document.getElementById('back-button')!;
		backbtn.onclick = () => {
			if (history.length > 1) {
				history.back();
			} else {
				this.router.route('/', true);
			}
		};

		const params = new URLSearchParams(location.search);
		const op = params.get("op");
		const difficulty = parseInt(params.get("difficulty") ?? "1");
		const cv = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const context = cv.getContext('2d')!;
		context.fillStyle = 'black';
		context.fillRect(0, 0, cv.width, cv.height);
		const p1_score = document.getElementById("p1_score")! as HTMLDivElement;
		const p2_score = document.getElementById("p2_score")! as HTMLDivElement;
		const ball = new Ball(cv.width / 2, cv.height / 2, 10, 15, 'white');
		const left_paddle = new Paddle(90, 20, 20, (cv.height - 90) / 2, 10, 'orange');
		const right_paddle = new Paddle(90, 20, cv.width - (20 * 2), (cv.height - 90) / 2, 10, 'red');
		const bot = (op == "bot") ? new Bot(cv, right_paddle, ball, difficulty) : null;

		this.end_game = start_game(cv, ball, left_paddle, right_paddle, p1_score, p2_score, bot);
	}

	unload() {
		this.end_game();
	}
}