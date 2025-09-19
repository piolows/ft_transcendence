import "./styles.css";

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas");
const context = cv.getContext('2d');
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);

// circle variables
let dY = 4;
let dX = 4;
let r = 15
let x = r;
let y = r;
let style = 'white';

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
}

// left paddle variables
const paddleH = 90;
const paddleW = 20;
let paddleY = (cv.height - paddleH) / 2;
let paddleX = paddleW;
let up = false;
let down = false;

// right paddle variables
const rPaddleH = 90;
const rPaddleW = 20;
let rPaddleY = (cv.height - rPaddleH) / 2;
let rPaddleX = cv.width - (rPaddleW * 2);
let rup = false;
let rdown = false;

let interval = 0;

function drawPaddle()
{
	if (rup)
		rPaddleY = Math.max(rPaddleY - 5, 0);
	if (rdown)
		rPaddleY = Math.min(rPaddleY + 5, cv.height - rPaddleH);
	if (up)
		paddleY = Math.max(paddleY - 5, 0);
	if (down)
		paddleY = Math.min(paddleY + 5, cv.height - paddleH);
	context.beginPath();
	context.rect(paddleX, paddleY, paddleW, paddleH);
	context.rect(rPaddleX, rPaddleY, rPaddleW, rPaddleH);
	context.fillStyle = 'white';
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
	if ((y >= paddleY - paddleH && y <= paddleY + paddleH  && (x + dX) - r < paddleX + paddleW) || y >= rPaddleY - rPaddleH && y <= rPaddleY + rPaddleH && (x + dX) + r > rPaddleX)
	{
		console.log('touched');
		style = 'teal';
		dX *= -1;
	}
	if (y + dY > cv.height - r || y + dY < r)
	{
		dY *= -1;
		style = 'yellow';
	}
	if (x + dX > cv.width - r || x + dX < r)
	{
		dX *= -1;
		style = 'red';
	}
	drawPaddle();
	circle(x += dX, y += dY, r);
}

function keyDownHandler(event)
{
	if (event.key == 'ArrowUp')
		rup = true;
	else if (event.key == 'ArrowDown')
		rdown = true;
	if (event.key == 'w')
		up = true;
	else if (event.key == 's')
		down = true;
}

function keyUpHandler(event)
{
	if (event.key == 'ArrowUp')
		rup = false;
	else if (event.key == 'ArrowDown')
		rdown = false;
	if (event.key == 'w')
		up = false;
	if (event.key == 's')
		down = false;
}

function circle(x: number, y: number, radius: number)
{
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI*2);
	// context.fillStyle = '#ffffff';
	context.fillStyle = style;
	context.fill();
	context.closePath();
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
interval = setInterval(draw, 10);