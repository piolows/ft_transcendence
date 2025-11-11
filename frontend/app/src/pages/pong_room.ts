import NavBar from "../components/nav_bar";
import Component, { backend_url, backend_websocket, sockets_url } from "../scripts/router";
import { Ball, Paddle, draw_frame } from "../scripts/server_game";

export default class PongRoom extends Component {
	private navbar = new NavBar(this.router);
	private game_id: string = "";
	private game_over: boolean = false;
	private socket: WebSocket | null = null;
	private admin: any = null;
	private left_player: any = null;
	private right_player: any = null;
	private direction: number = 0;
	private paddle: any;
	private canvas: any;
	private ball: any;
	private elements: any = {};
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

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		if (!this.admin)
			return ;
		this.navbar.load(app);
		app.innerHTML += `
			<div id="p1_score" hidden>0</div>
			<div id="p2_score" hidden>0</div>
			<div class="flex justify-center w-full" style="height: 500px;">
				<div id="gameInfo" class="flex flex-col pl-8 justify-center space-y-8 w-120">
					<div class="flex justify-left space-x-7"><label>Game Result: </label><label id="result"></label></div>
					<div class="flex justify-left space-x-7"><label>Game Timer: </label><div id="timer"><label id="minutes">00</label>:<label id="seconds">00</label></div></div>
					<div class="flex justify-left space-x-7"><label>Spectator Count: </label><label id="spectators">0</label></div>
					<div class="flex flex-col justify-left space-y-2"><label>Game Room Code:</label><label>${ this.game_id }</label></div>
					<div class="flex justify-left space-x-7"><label>Room Created By:</label></div>
					<div id="admin-info">
						<div class="flex items-center space-x-4">
							<img id="pfp" src="${ backend_url + this.admin.avatarURL }" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
							<div>
								<h4 id="username" class="crt-text">${ this.admin.username }</h4>
								<p id="email" class="text-xs font-silkscreen">${ this.admin.email }</p>
							</div>
						</div>
					</div>
				</div>
				<div id="parent-container" class="flex">
				</div>
				<div id="playersInfo" class="flex flex-col justify-center pl-8 space-y-10 w-120">
				</div>
			</div>`;
	}

	async get_info() {
		const root_len = "/pong/room".length;
		const uri_len = this.real_path?.length;
		if (!uri_len || uri_len < root_len) {
			await this.router.route_error(this.real_path, 404);
			return ;
		}
		let room = this.real_path.substring(root_len);
		if (room.length >= 1 && room[0] == "/")
			room = room.substring(1);
		if (room.indexOf("?") != -1)
			room = room.substring(0, room.indexOf("?"));
		const slash_at = room.indexOf("/");
		if ((slash_at != -1 && slash_at != room.length - 1) || room.length <= 1) {
			await this.router.route_error(this.real_path, 404);
			return ;
		}
		if (slash_at == room.length - 1)
			room = room.substring(0, room.length - 1);
		this.game_id = room;
		try {
			const response = await fetch(`${sockets_url}/pong/room/${this.game_id}`, {
				credentials: "include",
			});
			const data = await response.json();
			if (!data.success) {
				await this.router.route_error(this.real_path, data.code, data.error);
				return ;
			}
			this.admin = data.admin;
			this.left_player = data.players[0];
			this.right_player = data.players[1];
			this.canvas = data.canvas_info;
			this.paddle = data.paddle_info;
			this.ball = data.ball_info;
		} catch (error) {
			await this.router.route_error(this.real_path, 500);
			return ;
		};
	}

	setupElements() {
		const parent = document.getElementById('parent-container')!;
		parent.innerHTML = `<canvas id="gameCanvas" width="${this.canvas.width}" height="${this.canvas.height}"></canvas>`;
		this.elements.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
		this.elements.p1_score = document.getElementById("p1_score")!;
		this.elements.p2_score = document.getElementById("p2_score")!;
		this.elements.mins = document.getElementById('minutes')!;
		this.elements.secs = document.getElementById('seconds')!;
		this.elements.spectators = document.getElementById('spectators')!;
		this.elements.result = document.getElementById('result')!;
		this.elements.playersInfo = document.getElementById('playersInfo')!;
		if (this.elements.canvas) {
			this.elements.ball = new Ball(this.ball.x, this.ball.y, this.ball.r, 'white');
			this.elements.left_paddle = new Paddle(this.paddle.height, this.paddle.width, this.paddle.x, this.paddle.y, 'orange');
			this.elements.right_paddle = new Paddle(this.paddle.height, this.paddle.width, this.canvas.width - this.paddle.x - this.paddle.width, this.paddle.y, 'red');
			draw_frame(this.elements, null, this);
		}
	}

	setupSocket() {
		this.socket = new WebSocket(backend_websocket + "/pong");
		this.socket.onopen = () => {
			this.setupElements();
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "JOIN", param: "SPEC"}));
		};
		this.socket.onmessage = (message) => {
			try {
				const msg = JSON.parse(message.data);
				if (msg.exit) {
					this.game_over = true;
				}
				if (msg.role) {
					if (msg.role == "left_player")
						this.left_player = this.router.login_info;
					else if (msg.role == "right_player")
						this.right_player = this.router.login_info;
				}
				else {
					draw_frame(this.elements, msg, this);
				}
			} catch (error) {
				console.error("Unexpected communication from server.", message);
			}
		};
		this.socket.onclose = () => {
			this.socket = null;
			if (this.game_over) {
				return ;
			}
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

	keyDownHandler = (event: any) => {
		if (this.direction != 1 && (event.key == 'w' || event.key == 'W')) {
			this.direction = 1;
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "MOVE_UP"}));
		}
		if (this.direction != -1 && (event.key == 's' || event.key == 'S')) {
			this.direction = -1;
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "MOVE_DOWN"}));
		}
	}

	keyUpHandler = (event: any) => {
		if (this.direction != 0 && (event.key == 'w' || event.key == 'W')) {
			this.direction = 0;
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "STOP"}));
		}
		if (this.direction != 0 && (event.key == 's' || event.key == 'S')) {
			this.direction = 0;
			this.socket?.send(JSON.stringify({game_id: this.game_id, action: "STOP"}));
		}
	}

	init() {
		this.navbar.init();
		this.setupSocket();
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