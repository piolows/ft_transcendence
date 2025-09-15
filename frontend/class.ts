import "./styles.css";

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas");
const context = cv.getContext('2d');
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);
let ballSpeed = 1;

class Circle
{
	speed: number;
	// dX: number;
	// dY: number;
	radius: number;
	x: number;
	y: number;
	color: string

	// constructor(dx: number, dy: number, r: number, x: number, y: number, c: string)
	constructor(speed: number, number, r: number, x: number, y: number, c: string)
	{
		this.speed = ballSpeed;
		// this.dX = dx;
		// this.dY = dy;
		this.radius = r;
		this.x = x;
		this.y = y;
		this.color = c;
	}
}

let ball = new Circle(ballSpeed, ballSpeed, 15, 15, 15, 'white');

// left paddle variables
const paddleH = 90;
const paddleW = 20;
let paddleY = (cv.height - paddleH) / 2;
let paddleX = paddleW;
let up = false;
let down = false;

let interval = 0;

function drawPaddle()
{
	if (up)
		paddleY = Math.max(paddleY - 5, 0);
	if (down)
		paddleY = Math.min(paddleY + 5, cv.height - paddleH);
	context.beginPath();
	context.rect(paddleX, paddleY, paddleW, paddleH);
	context.fillStyle = 'white';
	context.fill();
	context.closePath();
}

function draw()
{
	context.clearRect(0, 0, cv.width, cv.height);
	context.fillStyle = 'black';
	context.fillRect(0, 0, cv.width, cv.height);
	if (ball.y >= paddleY - paddleH && ball.y <= paddleY + paddleH  && (ball.x + ball.speed) - ball.radius < paddleX + paddleW)
	{
		console.log('touched');
		ball.color = 'teal';
		ball.speed *= -1;
	}
	if (ball.y + ball.speed > cv.height - ball.radius || ball.y + ball.speed < ball.radius)
	{
		ball.speed *= -1;
		ball.color = 'yellow';
	}
	if (ball.x + ball.speed > cv.width - ball.radius || ball.x + ball.speed < ball.radius)
	{
		ball.speed *= -1;
		ball.color = 'red';
	}
	drawPaddle();
	updateCircle(ball);
}

function keyDownHandler(event)
{
	if (event.key == 'w')
		up = true;
	else if (event.key == 's')
		down = true;
}

function keyUpHandler(event)
{
	if (event.key == 'w')
		up = false;
	if (event.key == 's')
		down = false;
}

// function createCircle(x: number, y: number, radius: number)
// {
// 	context.beginPath();
// 	context.arc(x, y, radius, 0, Math.PI*2);
// 	// context.fillStyle = '#ffffff';
// 	context.fillStyle = style;
// 	context.fill();
// 	context.closePath();
// }

function updateCircle(circle: Circle)
{
	context.beginPath();
	context.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2);
	context.fillStyle = circle.color;
	context.fill();
	context.closePath();
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
interval = setInterval(draw, 10);