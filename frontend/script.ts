import "./styles.css";

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas");
const context = cv.getContext('2d');
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);

// circle variables
let dY = 3;
let dX = 3;
let r = 15
let x = r;
let y = r;
let style = 'white';

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
	if (y >= paddleY - paddleH && y <= paddleY + paddleH  && (x + dX) - r < paddleX + paddleW)
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