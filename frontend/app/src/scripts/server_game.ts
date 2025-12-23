import { backend_url } from "./router";

export class Ball
{
	x: number;
	y: number;
	r: number;
	color: string;

	constructor(x: number, y: number, radius:number, c: string)
	{
		this.x = x;
		this.y = y;
		this.r = radius;
		this.color = c;
	}
}

export class Paddle
{
	height: number;
	width: number;
	x: number;
	y: number;
	color: string;

	constructor(h: number, w: number, x: number, y: number, c: string)
	{
		this.height = h;
		this.width = w;
		this.x = x;
		this.y = y;
		this.color = c;
	}
};

function drawPaddle(cv: HTMLCanvasElement, paddle: Paddle)
{
	const context = cv.getContext('2d')!;
	context.beginPath();
	context.rect(paddle.x, paddle.y, paddle.width, paddle.height);
	context.fillStyle = paddle.color;
	context.fill();
	context.closePath();
}

function draw_bg(cv: HTMLCanvasElement, p1_score: HTMLDivElement, p2_score: HTMLDivElement, p1_name: string, p2_name: string)
{
	const context = cv.getContext('2d')!;
	const middle_line_width = 6;
	context.clearRect(0, 0, cv.width, cv.height);
	context.fillStyle = 'black';
	context.fillRect(0, 0, cv.width, cv.height);
	// draw center vertical line
	context.fillStyle = 'white';
	context.fillRect(cv.width / 2 - middle_line_width / 2, 0, middle_line_width, cv.height);

	// draw the score
	context.font = "30px 'Press Start 2P'";
	context.textAlign = "center";
	context.textBaseline = "top";
	context.fillText(p2_score.innerHTML, cv.width / 4, 20);
	context.fillText(p1_score.innerHTML, (cv.width / 4) * 3, 20);

	// draw usernames beneath the score
	context.font = "20px 'Pixelify Sans'";
	context.fillText(p1_name, cv.width / 4, 60);
	context.fillText(p2_name, (cv.width / 4) * 3, 60);

	context.fillStyle = 'white';
	context.beginPath();
	context.arc(cv.width / 2 + 1, cv.height / 2, 101, 0, Math.PI * 2);
	context.strokeStyle = 'white';
	context.lineWidth = 5;
	context.stroke();
	context.closePath();
}

function drawBall(cv: HTMLCanvasElement, ball: Ball)
{
	const context = cv.getContext('2d')!;
	context.beginPath();
	// context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
	context.fillStyle = ball.color;
	context.fillRect(ball.x, ball.y, ball.r, ball.r);
	context.fill();
	context.closePath();
}

//	started: game.started,
// 	full: (game.player_count() == 2),
// 	time: game.time,
// 	players: game.players,
// 	game_over: game.game_over,
// 	timeout: game.timeout,
// 	p1_score: game.p1_score,
// 	p2_score: game.p2_score,
// 	admin: game.admin_info,
// 	spec_count: game.spec_count(),
// 	left_paddle: {
// 		y: game.left_player.paddle.y,
// 	},
// 	right_paddle: {
// 		y: game.right_player.paddle.y,
// 	},
// 	ball: {
// 		x: game.ball.x,
// 		y: game.ball.y,
// 		moving: game.ball.moving,
// 	}

function timeFormat(time: number) {
	if (time < 9 && time >= 0) {
		return `0${time}`;
	}
	else if (time < 59) {
		return `${time}`;
	}
	return "00";
}

export async function draw_frame(elements: any, message: any, room: any) {
	// console.log("DRAW");
	if (message) {
		// console.log("NOW");
		elements.p1_score.innerText = message.p1_score;
		elements.p2_score.innerText = message.p2_score;
		elements.left_paddle.y = message.left_paddle.y;
		elements.right_paddle.y = message.right_paddle.y;
		elements.ball.x = message.ball.x;
		elements.ball.y = message.ball.y;
		elements.ball.moving = message.ball.moving;
		elements.mins.innerText = timeFormat(Math.floor(message.time / 60));
		elements.secs.innerText = timeFormat(message.time % 60);
		elements.spectators.innerText = message.spec_count;
		if (message.game_over)
			elements.result.innerText = (message.winner == 0 ? 'Draw' : (message.winner == -1 ? 'Player 1 Won' : 'Player 2 Won'));
		room.left_player = message.left_player;
		room.right_player = message.right_player;
		elements.playersInfo.innerHTML = `
			<div class="pixel-box bg-blue-800 p-3 text-center mb-4"><p class="text-xs font-pixelify text-gray-300 mb-2">Player 1</p>
			${ room.left_player ?
			`<div id="player1-info">
				<div class="flex flex-col items-center space-x-4">
					<img id="pfp" src="${ backend_url + room.left_player.avatarURL }" class="w-12 h-12 rounded-full pixel-box bg-blue-800" alt="Profile">
					<div>
						<h4 id="username" class="crt-text">${ room.left_player.username }</h4>
						<p id="email" class="text-xs font-silkscreen">${ room.left_player.email }</p>
					</div>
				</div>
			</div></div>` : `<div><p class="text-xs text-white">Seat Empty!</p></div><div><button id="take_seat_1" class="bg-blue-500 text-white py-1 mt-5 mb-2 pixel-box font-pixelify hover:bg-blue-600 clicky" style="width: 120px;">TAKE SEAT</button></div></div>`}
			<div class="pixel-box bg-blue-800 p-3 text-center mb-4"><p class="text-xs font-pixelify text-gray-300 mb-2">Player 2</p>
			${ room.right_player ?
			`<div id="player2-info">
				<div class="flex flex-col items-center space-x-4">
					<img id="pfp" src="${ backend_url + room.right_player.avatarURL }" class="w-12 h-12 rounded-full pixel-box bg-blue-800" alt="Profile">
					<div>
						<h4 id="username" class="crt-text">${ room.right_player.username }</h4>
						<p id="email" class="text-xs font-silkscreen">${ room.right_player.email }</p>
					</div>
				</div>
			</div></div>` : `<div><p class="text-xs text-white">Seat Empty!</p></div><div><button id="take_seat_2" class="bg-blue-500 text-white py-1 mt-5 mb-2 pixel-box font-pixelify hover:bg-blue-600 clicky" style="width: 120px;">TAKE SEAT</button></div></div>`}`;
		const ts1 = document.getElementById('take_seat_1')!;
		if (ts1) {
			ts1.onclick = () => {
				room.socket?.send(JSON.stringify({game_id: room.game_id, action: "PLAY", param: "LEFT"}));
			};
		}
		const ts2 = document.getElementById('take_seat_2')!;
		if (ts2) {
			ts2.onclick = () => {
				room.socket?.send(JSON.stringify({game_id: room.game_id, action: "PLAY", param: "RIGHT"}));
			};
		}
	}
	draw_bg(elements.canvas, elements.p1_score, elements.p2_score, "Player 1", "Player 2");
	drawPaddle(elements.canvas, elements.left_paddle);
	drawPaddle(elements.canvas, elements.right_paddle);
	drawBall(elements.canvas, elements.ball);
}
