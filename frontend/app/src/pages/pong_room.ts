import NavBar from "../components/nav_bar";
import Component, { backend_url, backend_websocket, Router, sockets_url } from "../scripts/router";
import { Ball, Paddle, draw_frame } from "../scripts/server_game";

export default class PongRoom extends Component {
	// private navbar = new NavBar(this.router);
	private preferance = "SPEC";
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
	
	constructor(router: Router) {
		super(router);
		this.back_url = "/pong/menu";
		// this.navbar.back_url = "/pong/menu";
	}

	async load(app: HTMLDivElement | HTMLElement) {
		await this.get_info();
		if (!this.admin)
			return ;
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
					<!-- user info -->
					<div class="flex items-center space-x-6 justify-end">
						<div id="user-section"></div>
					</div>
				</div>
			</div>
			
			<!-- main area -->
				<div class="flex-1 flex overflow-hidden">
					<!-- left sidebar -->
					<div class="w-72 bg-blue-900 border-r-2 border-blue-700 p-4 flex flex-col overflow-hidden">
						<div class="flex flex-col h-full justify-between">
							<div class="pixel-box bg-blue-800 p-3 text-center mb-4">
								<p class="text-xs font-pixelify text-gray-300 mb-2">CONTROLS</p>
								<p class="text-xs text-white">W/S</p>
								<p class="text-xs text-white">to move</p>
							</div>
							<div class="pixel-box bg-blue-800 p-3 text-center mb-4">
								<p class="text-xs font-pixelify text-gray-300 mb-2">GAME STATUS</p>
								<p id="result" class="text-white">WAITING</p>
								<button id="startGame" class="text-white py-1 mt-2 mb-5 pixel-box font-pixelify ${this.router.login_info.id == this.admin.id || this.game_over ? 'bg-blue-500 hover:bg-blue-600 clicky' : 'bg-gray-500 hover:bg-gray-600'}" style="width: 120px;">START GAME</button>
								<p class="text-xs text-white">${this.router.login_info.id == this.admin.id ? 'Bots will replace the empty seats' : `Only the admin can start the game`}</p>
							</div>
							<div class="pixel-box bg-blue-800 p-3 text-center mb-4">
								<p class="text-xs font-pixelify text-gray-300 mb-2">ROOM CODE</p>
								<p class="text-sm text-white font-bold">${ this.game_id }</p>
							</div>
							<div class="pixel-box bg-blue-800 p-3 text-center">
								<p class="text-xs font-pixelify text-gray-300 mb-2">CREATED BY</p>
								<div class="flex flex-row justify-center items-center space-y-2">
									<img src="${ backend_url + this.admin.avatarURL }" class="w-10 h-10 rounded-full pixel-box mr-3" alt="Admin">
									<p class="text-xs text-white">${ this.admin.username }</p>
								</div>
							</div>
						</div>
					</div>

					<!-- canvas -->
					<div class="flex-1 flex items-center justify-center bg-black">
						<div id="parent-container"></div>
					</div>

					<!-- right sidebar -->
					<div class="w-72 bg-blue-900 border-l-2 border-blue-700 p-4 flex flex-col justify-between overflow-hidden">
						<div id="playersInfo" class="flex flex-col h-full justify-between">
							<div class="pixel-box bg-blue-800 p-3 text-center mb-4">
								<p class="text-xs font-pixelify text-gray-300 mb-2">SPECTATORS</p>
								<p id="spectators" class="text-white text-lg font-bold">0</p>
							</div>
							<div>
								<a href="/pong/menu" router-link>
								<div class="pixel-box bg-blue-800 p-3 text-center mb-4">
									<p class="text-xs font-pixelify text-gray-300 mb-2">GAME MODE</p>
									<p class="text-white">ONLINE</p>
								</div>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
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
			[room, this.preferance] = room.split("?");
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
			this.left_player = data.left_player;
			this.right_player = data.right_player;
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
		parent.innerHTML = `<canvas id="gameCanvas" width="${this.canvas.width}" height="${this.canvas.height}" style="background-color: black; border: 3px solid #1e40af;"></canvas>`;
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
			if (this.preferance == "SPEC" || this.preferance == "EITHER")
				this.socket?.send(JSON.stringify({game_id: this.game_id, action: "JOIN", param: this.preferance}));
			else if (this.preferance == "PLAY")
				this.socket?.send(JSON.stringify({game_id: this.game_id, action: "PLAY"}));
			else
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
			} catch (error: any) {
				console.error(error.status, error.text);
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

	async init() {
		// this.navbar.init();
		// back button
		const backbtn = document.getElementById('back_btn')!;
		backbtn.onclick = () => {
			if (history.length > 2) {
				history.back();
			} else {
				this.router.route("/pong/menu", "replace");
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