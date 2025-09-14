import "./styles.css";

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas");
const context = cv.getContext('2d');
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);
var x = 0;
var y = 0;

function draw()
{
	context.clearRect(0, 0, cv.width, cv.height);
	context.fillStyle = 'black';
	context.fillRect(0, 0, cv.width, cv.height);
	circle(cv.width / 2, y += 2, 15);
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