import "./styles.css";

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas");
const context = cv.getContext('2d');
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);

class Ball
{
	x: number;
	y: number;
	xVel: number;
	yVel: number;
	speed: number;
	r: number;
	color: string;

	constructor(xPos: number, yPos: number, speed: number, radius:number, c: string)
	{
		this.x = xPos;
		this.y = yPos;
		this.speed = speed;
		this.r = radius;
		this.color = c;
		this.xVel = speed;
		this.yVel = speed;
	}
}

class Paddle
{
	height: number;
	width: number;
	xPos: number;
	yPos: number;
	color: string;
	up: boolean;
	down: boolean;

	constructor(h: number, w: number, x: number, y: number, c: string)
	{
		this.height = h;
		this.width = w;
		this.xPos = x;
		this.yPos = y;
		this.color = c;
		this.up = false;
		this.down = false;
	}
};

// circle variables
let dX = 4;
let dY = 4;
let r = 15
let x = r;
let y = r;
let style = 'white';
const ball = new Ball(cv.width / 2, cv.height / 2, 2, 20, 'red');

// left paddle variables
let left_paddle = new Paddle(90, 20, 20, (cv.height - 90) / 2, 'orange');

// right paddle variables
let right_paddle = new Paddle(90, 20, cv.width - (20 * 2), (cv.height - 90) / 2, 'red');

let interval = 0;

function drawPaddle(paddle: Paddle)
{
	if (paddle.up)
		paddle.yPos = Math.max(paddle.yPos - 5, 0);
	if (paddle.down)
		paddle.yPos = Math.min(paddle.yPos + 5, cv.height - paddle.height);
	context.beginPath();
	context.rect(paddle.xPos, paddle.yPos, paddle.width, paddle.height);
	context.fillStyle = paddle.color;
	context.fill();
	context.closePath();
}

function draw()
{
	context.clearRect(0, 0, cv.width, cv.height);
	context.fillStyle = 'black';
	context.fillRect(0, 0, cv.width, cv.height);
	// draw center vertical line
	context.fillStyle = 'white';
	context.fillRect(cv.width / 2 - 10, 0, 10, cv.height);
	if ((ball.y >= left_paddle.yPos - left_paddle.height && ball.y <= left_paddle.yPos + left_paddle.height  && (ball.x + ball.speed) - ball.r < left_paddle.xPos + left_paddle.width)
		|| ball.y >= right_paddle.yPos - right_paddle.height && ball.y <= right_paddle.yPos + right_paddle.height && (ball.x + ball.speed) + ball.r > right_paddle.xPos)
	{
		style = 'pink';
		ball.xVel *= -1;
		// ball.speed *= -1;
	}
	if (ball.y + ball.speed > cv.height - ball.r || ball.y + ball.speed < ball.r)
	{
		ball.yVel *= -1;
		style = 'yellow';
	}
	if (ball.x + ball.speed > cv.width - ball.r || ball.x + ball.speed < ball.r)
	{
		ball.xVel	 *= -1;
		style = 'red';
	}
	drawPaddle(left_paddle);
	drawPaddle(right_paddle);
	drawBall(ball);
	// circle(ball.x += ball.speed, ball.y += ball.speed, r);
}

function keyDownHandler(event)
{
	if (event.key == 'ArrowUp')
		right_paddle.up = true;
	else if (event.key == 'ArrowDown')
		right_paddle.down = true;
	if (event.key == 'w')
		left_paddle.up = true;
	else if (event.key == 's')
		left_paddle.down = true;
}

function keyUpHandler(event)
{
	if (event.key == 'ArrowUp')
		right_paddle.up = false;
	else if (event.key == 'ArrowDown')
		right_paddle.down = false;
	if (event.key == 'w')
		left_paddle.up = false;
	if (event.key == 's')
		left_paddle.down = false;
}

function drawBall(ball: Ball)
{
	context.beginPath();
	context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
	context.fillStyle = ball.color;
	context.fill();
	context.closePath();
	ball.x += ball.xVel;
	ball.y += ball.yVel;
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
interval = setInterval(draw, 10);