import { backend_url, Router } from "./router";
import { TournamentPlayer } from "../pages/tournament_init";
export class Ball
{
	x: number;
	y: number;
	xVel: number;
	yVel: number;
	speed: number;
	init_speed: number;
	r: number;
	color: string;
	starting: boolean;
	moving: boolean;
	first_collision: boolean;

	constructor(xPos: number, yPos: number, speed: number, radius:number, c: string)
	{
		this.x = xPos;
		this.y = yPos;
		this.speed = speed;
		this.init_speed = speed;
		this.r = radius;
		this.color = c;
		this.xVel = speed;
		this.yVel = speed;
		this.starting = true;
		this.moving = false;
		this.first_collision = false;
	}
}

export class Paddle
{
	height: number;
	width: number;
	xPos: number;
	yPos: number;
	color: string;
	up: boolean;
	down: boolean;
	speed: number;

	constructor(h: number, w: number, x: number, y: number, speed: number, c: string)
	{
		this.height = h;
		this.width = w;
		this.xPos = x;
		this.yPos = y;
		this.speed = speed;
		this.color = c;
		this.up = false;
		this.down = false;
	}
};

export class Player {
	name = "Ponger";
	paddle: Paddle;
	type = "player";

	constructor(name: string, paddle: Paddle) {
		console.log(name);
		if (name != "")
			this.name = name;
		this.paddle = paddle;
	}
}

export class Bot extends Player {
	private cv: HTMLCanvasElement;
	private difficulty: number;
	private dest_y: number;
	private hitOffset: number = 0;
	private lastBallDirection: number = 0;
	type = "bot";

	constructor(name: string, paddle: Paddle, cv: HTMLCanvasElement, difficulty: number) {
		super(name, paddle);
		this.dest_y = cv.height / 2;
		this.cv = cv;
		this.difficulty = difficulty;
	}

	// update(ball_x: number, ball_y: number, ball_xVel: number, ball_yVel: number, moving: boolean) {
	// 	if (!moving) {
	// 		this.dest_y = this.cv.height / 2;
	// 		return;
	// 	}
	// 	const modifier = 2 - this.difficulty;
	// 	const variation = modifier * (Math.random()) * (0.05 * this.cv.height)
	// 		* (Math.random() > 0.5 ? -1 : 1) * (Math.random() < (0.4 * modifier) ? 1 : 0);
	// 	const intersect = ball_xVel > 0 ? this.cv.width : -this.cv.width;
	// 	const steps = Math.abs(intersect - ball_x) / ball_xVel;
	// 	const dest = Math.abs(ball_y + ball_yVel * steps);
	// 	const reflects = Math.floor(dest / this.cv.height);
	// 	if (reflects % 2 == 0 && ball_xVel > 0)
	// 		this.dest_y = (dest % this.cv.height) + variation;
	// 	else
	// 		this.dest_y = this.cv.height * (reflects + 1) - (dest % this.cv.height) + variation;
	// }

	// update(ball_x: number, ball_y: number, ball_xVel: number, ball_yVel: number, moving: boolean, paddleSide: 'left' | 'right') {
	// 	if (!moving) {
	// 		this.dest_y = this.cv.height / 2;
	// 		return;
	// 	}

	// 	if (Math.sign(ball_xVel) !== this.lastBallDirection) {
    //         this.lastBallDirection = Math.sign(ball_xVel);
    //         // Randomize which part of paddle to hit with
    //         // Range: -0.4 to 0.4 (negative = top of paddle, positive = bottom)
    //         this.hitOffset = (Math.random() - 0.5) * 0.8;
    //     }

	// 	const modifier = 2 - this.difficulty;
	// 	const variation = modifier * (Math.random()) * (0.05 * this.cv.height)
	// 		* (Math.random() > 0.5 ? -1 : 1) * (Math.random() < (0.4 * modifier) ? 1 : 0);
		
	// 	// Calculate intersection based on which paddle this is
	// 	const intersect = paddleSide === 'right' ? this.cv.width : 0;
		
	// 	// Only calculate if ball is heading toward this paddle
	// 	const ballHeadingTowardsPaddle = (paddleSide === 'right' && ball_xVel > 0) || 
	// 									(paddleSide === 'left' && ball_xVel < 0);
		
	// 	if (!ballHeadingTowardsPaddle) {
	// 		// Ball going away - return to center or track loosely
	// 		this.dest_y = this.cv.height / 2;
	// 		return;
	// 	}
		
	// 	const steps = Math.abs(intersect - ball_x) / Math.abs(ball_xVel);
	// 	const dest = Math.abs(ball_y + ball_yVel * steps);
	// 	const reflects = Math.floor(dest / this.cv.height);
		
	// 	let targetY;
	// 	if (reflects % 2 == 0)
    //         targetY = (dest % this.cv.height) + variation;
    //     else
    //         targetY = this.cv.height * (reflects + 1) - (dest % this.cv.height) + variation;
        
    //     // Apply the hit offset (multiply by paddle height to get pixel offset)
    //     this.dest_y = targetY + (this.hitOffset * this.paddle.height);
	// }

	update(ball_x: number, ball_y: number, ball_xVel: number, ball_yVel: number, moving: boolean, paddleSide: 'left' | 'right', currentSpeed: number) {
		if (!moving) {
			this.dest_y = this.cv.height / 2;
			return;
		}

		if (Math.sign(ball_xVel) !== this.lastBallDirection) {
			this.lastBallDirection = Math.sign(ball_xVel);
			
			// Difficulty affects prediction accuracy
			// Easy: -0.5 to 0.5 (larger range = less accurate)
			// Hard: -0.2 to 0.2 (smaller range = more accurate)
			const predictionRange = (3 - this.difficulty) * 0.4;
			this.hitOffset = (Math.random() - 0.5) * predictionRange;
		}

		// Difficulty-based reaction modifier
		// Easy bot (difficulty 0): more variation, slower reaction
		// Hard bot (difficulty 1): less variation, faster reaction
		const reactionFactor = 0.3 + (this.difficulty * 0.35); // 0.3 to 1.0
		const modifier = 2 - this.difficulty;
		
		// Add variation based on difficulty (easier = more mistakes)
		const variation = modifier * (Math.random()) * (0.08 * this.cv.height)
			* (Math.random() > 0.5 ? -1 : 1) 
			* (Math.random() < (0.3 * (modifier / 3)) ? 1 : 0);
		
		// Calculate intersection based on which paddle this is
		const intersect = paddleSide === 'right' ? this.cv.width : 0;
		
		// Only calculate if ball is heading toward this paddle
		const ballHeadingTowardsPaddle = (paddleSide === 'right' && ball_xVel > 0) || 
										(paddleSide === 'left' && ball_xVel < 0);
		
		if (!ballHeadingTowardsPaddle) {
			// Ball going away - return to center with some delay based on difficulty
			const centerBias = 0.5 + (this.difficulty * 0.35); // easier bots stay more centered
			this.dest_y = this.cv.height / 2 + ((Math.random() - 0.5) * this.cv.height * (1 - centerBias));
			return;
		}
		
		// Use actual ball speed for calculation to account for speed increases
		const ballSpeed = Math.sqrt(ball_xVel * ball_xVel + ball_yVel * ball_yVel);
		const speedRatio = ballSpeed / currentSpeed; // How much faster than initial speed
		
		// Harder bots anticipate speed increases better
		const speedCompensation = 1 + ((speedRatio - 1) * reactionFactor);
		
		// Calculate steps using current velocity magnitude
		const steps = Math.abs(intersect - ball_x) / Math.abs(ball_xVel);
		
		// Predict where ball will be, accounting for speed
		const predictedY = ball_y + (ball_yVel * steps * speedCompensation);
		const dest = Math.abs(predictedY);
		
		// Calculate wall bounces
		const reflects = Math.floor(dest / this.cv.height);
		
		let targetY;
		if (reflects % 2 == 0)
			targetY = (dest % this.cv.height) + variation;
		else
			targetY = this.cv.height * (reflects + 1) - (dest % this.cv.height) + variation;
		
		// Apply the hit offset (multiply by paddle height to get pixel offset)
		// Harder bots use smaller offsets for more consistent hits
		const offsetFactor = 0.3 + (this.difficulty * 0.35);
		this.dest_y = targetY + (this.hitOffset * this.paddle.height * offsetFactor);
		
		// Clamp to valid range
		this.dest_y = Math.max(this.paddle.height / 2, Math.min(this.dest_y, this.cv.height - this.paddle.height / 2));
	}

	play() {
		const y = this.paddle.yPos + this.paddle.height / 2;
		const diff = this.paddle.speed / 2;
		if (y < this.dest_y - diff)
			this.paddle.down = true;
		else
			this.paddle.down = false;
		if (y > this.dest_y + diff)
			this.paddle.up = true;
		else
			this.paddle.up = false;
		
	}
}

function drawPaddle(cv: HTMLCanvasElement, paddle: Paddle, delta: number)
{
	if (paddle.up)
		paddle.yPos = Math.max(paddle.yPos - (paddle.speed * delta), 0);
	if (paddle.down)
		paddle.yPos = Math.min(paddle.yPos + (paddle.speed * delta), cv.height - paddle.height);
	// context.drawImage(image, paddle.xPos, paddle.yPos, image.width, paddle.height);
	const context = cv.getContext('2d')!;
	context.beginPath();
	context.rect(paddle.xPos, paddle.yPos, paddle.width, paddle.height);
	context.fillStyle = paddle.color;
	context.fill();
	context.closePath();
}

function hit_wall(cv: HTMLCanvasElement, ball: Ball)
{
	if (ball.x + ball.speed > cv.width - ball.r)
	{
		ball.xVel *= -1;
		return ('right');
	}
	if (ball.x + ball.speed < ball.r)
	{
		ball.xVel *= -1;
		return ('left');
	}
	return ('none');
}

function resetBall(cv: HTMLCanvasElement, ball: Ball)
{
	ball.x = cv.width / 2 - ball.r / 2;
	ball.y = cv.height / 2 - ball.r / 2;
	ball.xVel = 0;
	ball.yVel = 0;
	ball.speed = ball.init_speed;
	ball.moving = false;
	setTimeout(() => {
		const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // -22.5° to +22.5°
		const direction = Math.random() < 0.5 ? 1 : -1; // left or right
		
		ball.xVel = direction * ball.speed * Math.cos(angle);
		ball.yVel = ball.speed * Math.sin(angle);
		ball.moving = true;
	}, 1000);
	ball.starting = false;
}

function hit_paddle(paddle: Paddle, ball: Ball, is_left: boolean = false)
{
	const future_pos = ball.x + ball.speed + (is_left ? -ball.r : ball.r);
	if (ball.y >= paddle.yPos && ball.y <= paddle.yPos + paddle.height)
	{
		if ((is_left && future_pos < paddle.xPos + paddle.width) 
		|| (!is_left && future_pos > paddle.xPos))
		{
			const center = paddle.yPos + paddle.height / 2;
			const normal_intersect = (ball.y - center) / (paddle.height / 2);
			const angle = normal_intersect * (Math.PI / 4);
			ball.xVel = ball.speed * Math.cos(angle);
			ball.yVel = ball.speed * Math.sin(angle);
			if (ball.speed < 15) ball.speed *= 1.05;	// use 15 as the cap for the ball speed
			if (!is_left)
				ball.xVel *= -1;
		}
	}
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
	context.fillText(p1_score.innerHTML, cv.width / 4, 20);
	context.fillText(p2_score.innerHTML, (cv.width / 4) * 3, 20);

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

function drawBall(cv: HTMLCanvasElement, ball: Ball, delta: number)
{
	const context = cv.getContext('2d')!;
	context.beginPath();
	// context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
	context.fillStyle = ball.color;
	context.fillRect(ball.x, ball.y, ball.r, ball.r);
	context.fill();
	context.closePath();
	ball.x += ball.xVel * delta;
	ball.y += ball.yVel * delta;
}

export function start_game(cv: HTMLCanvasElement, ball: Ball, left_player: Player | Bot, right_player: Player | Bot, p1_score: HTMLDivElement, p2_score: HTMLDivElement, timer: HTMLDivElement, router: Router, endOverlay?: (winner: any, p1Score: number, p2Score: number) => void) {
	let animationId: number;
	let game_over: boolean = false;
	const left_paddle = left_player.paddle;
	const right_paddle = right_player.paddle;
	const mins = timer.children[0];
	const secs = timer.children[2];
	let time = 0;
	let lastTime = performance.now();
	let lastSecond = performance.now();
	let lastSecondBot = performance.now();

	function keyDownHandler(event: any)
	{
		if (event.key == 'ArrowUp' && right_player.type != "bot")
			right_paddle.up = true;
		else if (event.key == 'ArrowDown' && right_player.type != "bot")
			right_paddle.down = true;
		if (event.key == 'w' || event.key == 'W' && left_player.type !== "bot")
			left_paddle.up = true;
		else if (event.key == 's' || event.key == 'S' && left_player.type !== "bot")
			left_paddle.down = true;
	}

	function keyUpHandler(event: any)
	{
		if (event.key == 'ArrowUp' && right_player.type != "bot")
			right_paddle.up = false;
		else if (event.key == 'ArrowDown' && right_player.type != "bot")
			right_paddle.down = false;
		if (event.key == 'w' || event.key == 'W' && left_player.type !== "bot")
			left_paddle.up = false;
		if (event.key == 's' || event.key == 'S' && left_player.type !== "bot")
			left_paddle.down = false;
	}

	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

	const end_game = () => {
			game_over = true;
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        };

	async function draw(currentTime: number)
	{
		// GAME HAS ENDED PIOLO LOOK
		if (time >= 300 || parseInt(p1_score.textContent!) >= 1 || parseInt(p2_score.textContent!) >= 1) {
			end_game();
			// check winner
			const p1Final = parseInt(p1_score.textContent || '0');
			const p2Final = parseInt(p2_score.textContent || '0');

			const params = new URLSearchParams(window.location.search);
			const tournament = params.get("tournament");
			const isTournament = sessionStorage.getItem("tournament") !== null && tournament !== null && tournament == "true";
			let winner: string | TournamentPlayer = 'draw';
			if (isTournament) {
				if (p1Final > p2Final) {
					winner = { name: left_player.name, isBot: left_player instanceof Bot };
				} else if (p2Final > p1Final) {
					winner = { name: right_player.name, isBot: right_player instanceof Bot };
				}
			} else {
				winner = p1Final > p2Final ? left_player.name : right_player.name;
			}

			if (endOverlay) {
				endOverlay(winner, p1Final, p2Final);
			}

			// update history will implement idk when
			if (!isTournament) {
				console.log("updating history becuase game is not a tournament game");
				try {
					const res = await fetch(`${backend_url}/users/${router.login_info.username}/history`, {
						method: "POST",
						headers: {"Content-Type": "application/json"},
						body: JSON.stringify ({
							game: "pong",
							op_name: right_player.name,
							op_id: router.login_info.id,
							winner_id: -1,
							time: time,
							p1_score: p1Final,
							p2_score: p2Final,
						}),
					});
					const data = await res.json();
					console.log(data);
				} catch (error) {
					console.log(error);
				}
				return ;
			} else {
				console.log("not updating history because game is a tournament game");
			}
		}

		const delta = (currentTime - lastTime) / 15;
		lastTime = currentTime;
		if (ball.starting === true)
		{
			lastSecondBot = currentTime - 900;
			resetBall(cv, ball);
		}
		draw_bg(cv, p1_score, p2_score, left_player.name, right_player.name);
		hit_paddle(left_paddle, ball, true);	// if the ball touched a paddle
		hit_paddle(right_paddle, ball);	// if the ball touched a paddle
		if (ball.y + ball.speed > cv.height - ball.r || ball.y + ball.speed < ball.r)	// ball hit the top or bottom boundaries
			ball.yVel *= -1;
		const wherehit = hit_wall(cv, ball);
		if (wherehit == 'right')
		{
			let current = p1_score.innerHTML;
			p1_score.innerHTML = (parseInt(current) + 1).toString();
			lastSecondBot = currentTime - 900;
			resetBall(cv, ball);
			ball.first_collision = false;
		}
		if (wherehit == 'left')
		{
			let current = p2_score?.innerHTML;
			p2_score.innerHTML = (parseInt(current) + 1).toString();
			lastSecondBot = currentTime - 900;
			resetBall(cv, ball);
			ball.first_collision = false;
		}
		// Runs every second
		if (currentTime - lastSecond >= 1000)
		{
			time += 1;
			const seconds = time % 60;
			const minutes = Math.floor(time / 60) % 60;
			mins.innerHTML = minutes < 10 ? `0${minutes}` : `${minutes}`;
			secs.innerHTML = seconds < 10 ? `0${seconds}` : `${seconds}`;
			lastSecond = currentTime;
		}
		if (currentTime - lastSecondBot >= 1000)
		{
			lastSecondBot = currentTime;
			if (left_player.type == "bot")
				(left_player as Bot)?.update(ball.x, ball.y, ball.xVel, ball.yVel, ball.moving, "left", ball.speed);
			if (right_player.type == "bot")
				(right_player as Bot)?.update(ball.x, ball.y, ball.xVel, ball.yVel, ball.moving, "right", ball.speed);
		}
		if (left_player.type == "bot")
			(left_player as Bot)?.play();
		if (right_player.type == "bot")
			(right_player as Bot)?.play();
		drawPaddle(cv, left_paddle, delta);
		drawPaddle(cv, right_paddle, delta);
		drawBall(cv, ball, delta);
		if (!game_over)
			animationId = requestAnimationFrame(draw);
	}

	if (!game_over)
		animationId = requestAnimationFrame(draw);

	// Return a controller to stop the game
    return end_game;
}
