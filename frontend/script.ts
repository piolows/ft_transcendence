import "./styles.css";

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas");
const context = cv.getContext('2d');
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);
let x = 0;
let y = 0;
let dY = 1.5;
let dX = 1.5;
let r = 15

function draw()
{
	context.clearRect(0, 0, cv.width, cv.height);
	context.fillStyle = 'black';
	context.fillRect(0, 0, cv.width, cv.height);
	if (y + dY > cv.height - r)
		dY *= -1;
	if (y + dY > cv.height - r || y + dY < 0)
		dY *= -1;
	if (x + dX > cv.width - r)
		dX *= -1;
	if (x + dX > cv.width - r || x + dX < 0)
		dX *= -1;
	circle(cv.width / 2, y += dY, r);
}

function circle(x: number, y: number, radius: number)
{
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI*2);
	context.fillStyle = '#ffffff';
	context.fill();
	context.closePath();
}

setInterval(draw, 10);