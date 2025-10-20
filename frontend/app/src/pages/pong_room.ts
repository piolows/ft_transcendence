import Component, { backend_websocket, Router, sockets_url } from "../scripts/router";

export default class PongRoom extends Component {
	private socket: WebSocket | null = null;
	private admin: any = null;
	private left_player: any = null;
	private right_player: any = null;
	private game_canvas = `<canvas id="gameCanvas" width="800" height="600"></canvas>`;
	private retry_display = `
		<label>Connection Error: Could not establish connection with server.</label>
		<button id="retry">Retry</button>`;
	real_path: string = "";

	constructor(router: Router) {
		super(router);
	}

	load(app: HTMLDivElement | HTMLElement) {
		fetch(`${sockets_url}${this.real_path}`, {
			method: "POST",
			credentials: "include",
		}).then(response => response.json())
		.then(data => {
			if (!data.success) {
				this.router.route_error(this.real_path, data.code, data.error);
				return ;
			}
			console.log(JSON.stringify(data));
			this.admin = data.admin;
			this.left_player = data.players[0];
			this.right_player = data.players[1];
			try {
				this.socket = new WebSocket(backend_websocket + "/pong");
			} catch(error) {
				this.socket = null;
			}
			app.innerHTML = `
				<div class="w-screen flex pb-5 pt-3 items-center justify-center">
					<div class="flex w-200">
						<div id="timer" class="my-auto text-white">
							<label>Timer: </label><label id="minutes">00</label>:<label id="seconds">00</label>
						</div>
						<h1 class="text-4xl font-bold text-blue-500 underline italic text-center my-auto ml-20">${this.admin?.username}-${this.left_player?.username}-${this.right_player?.username}</h1>
					</div>
				</div>
				<div id="p1_score" class="hidden">0</div>
				<div id="p2_score" class="hidden">0</div>
				<div id="parent-container" class="flex justify-center w-full" style="height: 600;">
					${this.socket ? this.game_canvas : this.retry_display}
				</div>`;
		}).catch (error => {
			this.router.route_error(this.real_path, 500);
			return ;
		});
	}

	init() {
		const retry_btn = document.getElementById('retry');
		if (retry_btn) {
			retry_btn.onclick = () => {
				try {
					this.socket = new WebSocket(backend_websocket + "/pong");
					const parent = document.getElementById('parent-container')!;
					parent.innerHTML = this.game_canvas;
				} catch(error) {
					this.socket = null;
				}
			}
		}
		// const ball_speed = 8;
		// const ball_radius = 16;
		// const paddle_speed = 8;
		// const params = new URLSearchParams(location.search);
		// const op = params.get("op");
		// const difficulty = parseInt(params.get("difficulty") ?? "1");
		// const cv = document.getElementById("gameCanvas") as HTMLCanvasElement;
		// const context = cv.getContext('2d')!;
		// context.fillStyle = 'black';
		// context.fillRect(0, 0, cv.width, cv.height);
		// const p1_score = document.getElementById("p1_score")! as HTMLDivElement;
		// const p2_score = document.getElementById("p2_score")! as HTMLDivElement;
		// const timer = document.getElementById('timer')! as HTMLDivElement;
		// const ball = new Ball(cv.width / 2, cv.height / 2, ball_speed, ball_radius, 'white');
		// const left_paddle = new Paddle(90, 20, 20, (cv.height - 90) / 2, paddle_speed, 'orange');
		// const right_paddle = new Paddle(90, 20, cv.width - (20 * 2), (cv.height - 90) / 2, paddle_speed, 'red');
		// const player1 = new Player("Player 1", left_paddle);
		// const player2 = (op == "bot") ? new Bot("AI Bot", right_paddle, cv, difficulty) : new Player("Player 2", right_paddle);
	}

	unload() {
		this.socket?.close();
	}
}