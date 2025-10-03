export class Ball
{
	x;
	y;
	xVel;
	yVel;
	speed;
	r;
	color;
	starting;
	first_collision;

	constructor(xPos, yPos, speed, radius, c)
	{
		this.x = xPos;
		this.y = yPos;
		this.speed = speed;
		this.r = radius;
		this.color = c;
		this.xVel = speed;
		this.yVel = speed;
		this.starting = true;
		this.first_collision = false;
	};
};

export class Paddle
{
	height;
	width;
	xPos;
	yPos;
	color;
	up;
	down;
	player1;

	constructor(h, w, x, y, c)
	{
		this.height = h;
		this.width = w;
		this.xPos = x;
		this.yPos = y;
		this.color = c;
		this.up = false;
		this.down = false;
	};
};

const ball_speed = 10;
const paddle_speed = 10;

	// const ball = new Ball(cv.width / 2, cv.height / 2, ball_speed, 15, 'white');
	// const left_paddle = new Paddle(90, 20, 20, (cv.height - 90) / 2, 'orange');
	// const right_paddle = new Paddle(90, 20, cv.width - (20 * 2), (cv.height - 90) / 2, 'red');
	// if (paddle.up)
	// 	paddle.yPos = Math.max(paddle.yPos - (paddle_speed * delta), 0);
	// if (paddle.down)
	// 	paddle.yPos = Math.min(paddle.yPos + (paddle_speed * delta), cv.height - paddle.height);

export function hit_wall(ball)
{
	if (ball.x + ball.speed > cv.width - ball.r)
	{
		ball.xVel *= -1;
		return ('right');
	}
	if (ball.x + ball.speed < ball.r)
	{
		ball.xVel *= -1;
		console.log('left wall hit');
		return ('left');
	}
	return ('none');
}

function resetBall(ball)
{
	ball.x = cv.width / 2 - ball.r / 2;
	ball.y = cv.height / 2;
	ball.xVel = 0;
	ball.yVel = 0;
	ball.speed = ball_speed;
	setTimeout(() => {
		const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // -22.5° to +22.5°
		const direction = Math.random() < 0.5 ? 1 : -1; // left or right
		
		ball.xVel = direction * ball.speed * Math.cos(angle);
		ball.yVel = ball.speed * Math.sin(angle);
	}, 1000);
	ball.starting = false;
}

export function hit_paddle(ball, paddle)
{
	if (ball.y >= paddle.yPos && ball.y <= paddle.yPos + paddle.height  && (ball.x + ball.speed) - ball.r < paddle.xPos + paddle.width)
	{
		const center = paddle.yPos + paddle.height / 2;
		const normal_intersect = (ball.y - center) / (paddle.height / 2);
		const angle = normal_intersect * (Math.PI / 4);
		// const speed = Math.sqrt(ball.xVel**2 + ball.yVel**2);
		ball.xVel = ball.speed * Math.cos(angle);
		ball.yVel = ball.speed * Math.sin(angle);
		// if (ball.first_collision != true)
		// 	ball.first_collision = true;
		ball.speed *= 1.05;
		if (paddle.player1)
			ball.xVel *= -1;
		// ball.xVel *= -1;
	}
}

	// if (ball.y + ball.speed > cv.height - ball.r || ball.y + ball.speed < ball.r)	// ball hit the top or bottom boundaries
	// 	ball.yVel *= -1;
	// const wherehit = hit_wall(ball);
	// if (wherehit == 'right')
	// {
	// 	let current = p1_score.innerHTML;
	// 	p1_score.innerHTML = (parseInt(current) + 1).toString();
	// 	// start_game(ball, left_paddle, right_paddle);
	// 	resetBall(ball);
	// 	ball.first_collision = false;
	// }
	// if (wherehit == 'left')
	// {
	// 	let current = p2_score?.innerHTML;
	// 	p2_score.innerHTML = (parseInt(current) + 1).toString();
	// 	// start_game(ball, left_paddle, right_paddle);
	// 	resetBall(ball);
	// 	ball.first_collision = false;
	// }

// function keyDownHandler(event)
// {
// 	if (event.key == 'ArrowUp')
// 		right_paddle.up = true;
// 	else if (event.key == 'ArrowDown')
// 		right_paddle.down = true;
// 	if (event.key == 'w' || event.key == 'W')
// 		left_paddle.up = true;
// 	else if (event.key == 's' || event.key == 'S')
// 		left_paddle.down = true;
// }

// function keyUpHandler(event)
// {
// 	if (event.key == 'ArrowUp')
// 		right_paddle.up = false;
// 	else if (event.key == 'ArrowDown')
// 		right_paddle.down = false;
// 	if (event.key == 'w' || event.key == 'W')
// 		left_paddle.up = false;
// 	if (event.key == 's' || event.key == 'S')
// 		left_paddle.down = false;
// }
