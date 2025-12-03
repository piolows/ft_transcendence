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

	constructor(name: string = "", paddle: Paddle) {
		if (name != "")
			this.name = name;
		this.paddle = paddle;
	}
}

export class Bot extends Player {
	private cv: HTMLCanvasElement;
	private difficulty: number;
	private dest_y: number;
	type = "bot";

	constructor(name: string, paddle: Paddle, cv: HTMLCanvasElement, difficulty: number) {
		super(name, paddle);
		this.dest_y = cv.height / 2;
		this.cv = cv;
		this.difficulty = difficulty;
	}

	update(ball_x: number, ball_y: number, ball_xVel: number, ball_yVel: number, moving: boolean) {
		if (!moving) {
			this.dest_y = this.cv.height / 2;
			return;
		}
		const modifier = 2 - this.difficulty;
		const variation = modifier * (Math.random()) * (0.05 * this.cv.height)
			* (Math.random() > 0.5 ? -1 : 1) * (Math.random() < (0.4 * modifier) ? 1 : 0);
		const intersect = ball_xVel > 0 ? this.cv.width : -this.cv.width;
		const steps = Math.abs(intersect - ball_x) / ball_xVel;
		const dest = Math.abs(ball_y + ball_yVel * steps);
		const reflects = Math.floor(dest / this.cv.height);
		if (reflects % 2 == 0 && ball_xVel > 0)
			this.dest_y = (dest % this.cv.height) + variation;
		else
			this.dest_y = this.cv.height * (reflects + 1) - (dest % this.cv.height) + variation;
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
			// ball.speed *= 1.05;
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

export function start_game(cv: HTMLCanvasElement, ball: Ball, left_player: Player | Bot, right_player: Player | Bot, p1_score: HTMLDivElement, p2_score: HTMLDivElement, timer: HTMLDivElement) {
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
		if (event.key == 'w' || event.key == 'W')
			left_paddle.up = true;
		else if (event.key == 's' || event.key == 'S')
			left_paddle.down = true;
	}

	function keyUpHandler(event: any)
	{
		if (event.key == 'ArrowUp' && right_player.type != "bot")
			right_paddle.up = false;
		else if (event.key == 'ArrowDown' && right_player.type != "bot")
			right_paddle.down = false;
		if (event.key == 'w' || event.key == 'W')
			left_paddle.up = false;
		if (event.key == 's' || event.key == 'S')
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

	function draw(currentTime: number)
	{
		// GAME HAS ENDED PIOLO LOOK
		if (time >= 300 || parseInt(p1_score.textContent) >= 10 || parseInt(p2_score.textContent) >= 10) {
			end_game();
			// try {
			// 	await fetch(`${process.env.USERS_URL}/users/${this.router._info.username}/history`, {
			// 		method: "POST",
			// 		body: {
			// 			game: "pong",
			// 			op_id: players[1].user_info.id,
			// 			winner_id: this.winner == 0 ? -1 : (this.winner == -1 ? this.getPlayer('left') : this.getPlayer('right')),
			// 			time: this.setup.time,
			// 			p1_score: this.setup.p1_score,
			// 			p2_score: this.setup.p2_score,
			// 		}
			// 	});
			// } catch (error) {
			// 	console.log(error);
			// }
			return ;
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
			if (right_player.type == "bot")
				(right_player as Bot)?.update(ball.x, ball.y, ball.xVel, ball.yVel, ball.moving);
		}
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
