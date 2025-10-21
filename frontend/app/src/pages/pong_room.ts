import Component, { backend_url, backend_websocket, sockets_url } from "../scripts/router";
import { Ball, Paddle, draw_frame } from "../scripts/server_game";

export default class PongRoom extends Component {
	private game_id: string = "";
	private socket: WebSocket | null = null;
	private admin: any = null;
	private left_player: any = null;
	private right_player: any = null;
	private paddle: any;
	private canvas: any;
	private ball: any;
	private elements: any = {
		canvas: null,
		p1_score: null,
		p2_score: null,
		timer: null,
		ball: null,
		left_paddle: null,
		right_paddle: null,
	}
	private retry_display = `
		<div class="flex flex-col justify-center">
			<div class="w-full space-y-5">
				<h2>Connection Error:</h2>
				<h3>Could not establish connection with server.</h3>
				<div class="w-full flex justify-center">
					<button class="bg-blue-500 text-white py-3 mt-5 pixel-box font-pixelify hover:bg-blue-600 clicky" id="retry" style="width: 300px;">RETRY</button>
				</div>
			</div>
		</div>`;

	load(app: HTMLDivElement | HTMLElement) {
		this.game_id = this.real_path.substring(this.real_path.lastIndexOf("/") + 1);
		fetch(`${sockets_url}${this.real_path}`, {
			method: "POST",
			credentials: "include",
		}).then(response => response.json())
		.then(data => {
			if (!data.success) {
				this.router.route_error(this.real_path, data.code, data.error);
				return ;
			}
			this.admin = data.admin;
			this.left_player = data.players[0];
			this.right_player = data.players[1];
			this.canvas = data.canvas_info;
			this.paddle = data.paddle_info;
			this.ball = data.ball_info;
			app.innerHTML = `
				<div class="w-screen mx-auto flex justify-between pb-5 pt-3">
					<div class="flex w-auto space-x-5">
						<div class="flex">
							<button class="bg-blue-500 text-white py-3 mt-5 pixel-box font-pixelify hover:bg-blue-600 clicky" id="back_btn" style="width: 100px;">BACK</button>
						</div>
						<div class="flex my-auto text-white">
							<label>Timer: </label><label id="minutes">00</label>:<label id="seconds">00</label>
						</div>
					</div>
					<div class="flex w-auto space-x-5">
						<div class="flex" id="profile-info">
							<div class="flex items-center space-x-4">
								<img id="pfp" src="${ backend_url + this.router.login_info.avatarURL }" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
								<div>
									<h4 id="username" class="crt-text">${ this.router.login_info.username }</h4>
									<p id="email" class="text-xs font-silkscreen">${ this.router.login_info.email }</p>
								</div>
							</div>
						</div>
						<div class="flex">
							<button id="logout-button" class="hidden hover:text-blue-200 clicky wiggler">
								LOGOUT
							</button>
						</div>
					</div>
				</div>
				<div id="p1_score" class="hidden">0</div>
				<div id="p2_score" class="hidden">0</div>
				<div id="parent-container" class="flex justify-center w-full" style="height: 500px;">
				</div>`;
			const backbtn = document.getElementById('back_btn')!;
			backbtn.onclick = () => {
				if (history.length > 1) {
					history.back();
				}
				else {
					this.router.route("/", true);
				}
			};
			this.setupSocket();
		}).catch (error => {
			this.router.route_error(this.real_path, 500);
			return ;
		});
	}

	setupElements() {
		const parent = document.getElementById('parent-container')!;
		parent.innerHTML = `<canvas id="gameCanvas" width="${this.canvas.width}" height="${this.canvas.height}"></canvas>`;
		this.elements.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
		this.elements.p1_score = document.getElementById("p1_score")! as HTMLDivElement;
		this.elements.p2_score = document.getElementById("p2_score")! as HTMLDivElement;
		this.elements.mins = document.getElementById('minutes')! as HTMLDivElement;
		this.elements.secs = document.getElementById('seconds')! as HTMLDivElement;
		if (this.elements.canvas) {
			this.elements.ball = new Ball(this.ball.x, this.ball.y, this.ball.r, 'white');
			this.elements.left_paddle = new Paddle(this.paddle.height, this.paddle.width, this.paddle.x, this.paddle.y, 'orange');
			this.elements.right_paddle = new Paddle(this.paddle.height, this.paddle.width, this.canvas.width - this.paddle.x - this.paddle.width, this.paddle.y, 'red');
			draw_frame(this.elements, null);
		}
	}

	setupSocket() {
		this.socket = new WebSocket(backend_websocket + "/pong");
		this.socket.onopen = () => {
			this.setupElements();
			if (this.socket) {
				this.socket.send(JSON.stringify({game_id: this.game_id, action: "JOIN", param: "SPEC"}));
			}
		};
		this.socket.onmessage = (message) => {
			try {
				console.log(message.data);
				const msg = JSON.parse(message.data);
				if (msg.role) {
					if (msg.role == "left_player")
						this.left_player = this.router.login_info;
					else if (msg.role == "right_player")
						this.right_player = this.router.login_info;
				}
				else {
					draw_frame(this.elements, msg);
				}
			} catch (error) {
				console.error("Unexpected communication from server.");
			}
		};
		this.socket.onclose = () => {
			this.socket = null;
			const parent = document.getElementById('parent-container');
			parent && (parent.innerHTML = this.retry_display);
			const retry_btn = document.getElementById('retry')!;
			if (retry_btn) {
				retry_btn.onclick = () => {
					this.setupSocket();
				}
			}
		};
	}

	keyDownHandler(event: any)
	{
		if (event.key == 'w' || event.key == 'W')
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "MOVE_UP"}));
		else if (event.key == 's' || event.key == 'S')
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "MOVE_DOWN"}));
	}

	keyUpHandler(event: any)
	{
		if (event.key == 'w' || event.key == 'W')
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "STOP"}));
		if (event.key == 's' || event.key == 'S')
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "STOP"}));
	}

	init() {
		document.addEventListener('keyup', this.keyUpHandler, false);
		document.addEventListener('keydown', this.keyDownHandler, false);
	}

	unload() {
		this.socket?.send(JSON.stringify({game_id: this.game_id, action: "LEAVE"}));
		this.socket?.close();
		document.addEventListener('keyup', this.keyUpHandler, false);
		document.addEventListener('keydown', this.keyDownHandler, false);
	}
}