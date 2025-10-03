import "./styles.css";

class Ball
{
	x: number;
	y: number;
	xVel: number;
	yVel: number;
	speed: number;
	r: number;
	color: string;
	starting: boolean;
	first_collision: boolean;

	constructor(xPos: number, yPos: number, speed: number, radius:number, c: string)
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

console.log("This script is written in TypeScript!");

const cv = document.getElementById("gameCanvas") as HTMLCanvasElement;
const context = cv.getContext('2d')!;
const p1_score = document.getElementById("p1_score")!;
const p2_score = document.getElementById("p2_score")!;
context.fillStyle = 'black';
context.fillRect(0, 0, cv.width, cv.height);

const paddle_speed = 10;
const ball_speed = 10;

const ball = new Ball(cv.width / 2, cv.height / 2, ball_speed, 15, 'white');
const left_paddle = new Paddle(90, 20, 20, (cv.height - 90) / 2, 'orange');
const right_paddle = new Paddle(90, 20, cv.width - (20 * 2), (cv.height - 90) / 2, 'red');

let lastTime = performance.now();

const image = new Image();
image.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmJnHdxB4R5ZaBO2w7l-llydLWZcRmNAiaIA&s"; 


function drawPaddle(paddle: Paddle, delta: number)
{
	if (paddle.up)
		paddle.yPos = Math.max(paddle.yPos - (paddle_speed * delta), 0);
	if (paddle.down)
		paddle.yPos = Math.min(paddle.yPos + (paddle_speed * delta), cv.height - paddle.height);
	// context.drawImage(image, paddle.xPos, paddle.yPos, image.width, paddle.height);
	context.beginPath();
	context.rect(paddle.xPos, paddle.yPos, paddle.width, paddle.height);
	context.fillStyle = paddle.color;
	context.fill();
	context.closePath();
}

function hit_wall(ball: Ball)
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

function resetBall(ball: Ball)
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

function hit_paddle(ball: Ball)
{
	if (ball.y >= left_paddle.yPos && ball.y <= left_paddle.yPos + left_paddle.height  && (ball.x + ball.speed) - ball.r < left_paddle.xPos + left_paddle.width)
	{
		// console.log('ball hit left paddle');
		const center = left_paddle.yPos + left_paddle.height / 2;
		const normal_intersect = (ball.y - center) / (left_paddle.height / 2);
		const angle = normal_intersect * (Math.PI / 4);
		// const speed = Math.sqrt(ball.xVel**2 + ball.yVel**2);
		ball.xVel = ball.speed * Math.cos(angle);
		ball.yVel = ball.speed * Math.sin(angle);
		// if (ball.first_collision != true)
		// 	ball.first_collision = true;
		ball.speed *= 1.05;
		// ball.xVel *= -1;
	}
	if (ball.y >= right_paddle.yPos && ball.y <= right_paddle.yPos + right_paddle.height && (ball.x + ball.speed) + ball.r > right_paddle.xPos)
	{
		// console.log('ball hit right paddle');
		const center = right_paddle.yPos + right_paddle.height / 2;
		const normal_intersect = (ball.y - center) / (right_paddle.height / 2);
		const angle = normal_intersect * (Math.PI / 4);
		// const speed = Math.sqrt(ball.xVel**2 + ball.yVel**2); // constant speed
		ball.xVel = ball.speed * Math.cos(angle);
		ball.yVel = ball.speed * Math.sin(angle);
		// if (ball.first_collision != true)
		// 	ball.first_collision = true;
		ball.xVel *= -1;
		ball.speed *= 1.05;
	}
}

function draw_bg()
{
	const middle_line_width = 5;
	context.clearRect(0, 0, cv.width, cv.height);
	context.fillStyle = 'black';
	context.fillRect(0, 0, cv.width, cv.height);
	// draw center vertical line
	context.fillStyle = 'white';
	context.fillRect(cv.width / 2, 0, middle_line_width, cv.height);

	// draw the score
	context.font = "30px SixtyFour";
	context.textAlign = "center";
	context.textBaseline = "top";
	context.fillText(p1_score.innerHTML, cv.width / 4, 20);
	context.fillText(p2_score.innerHTML, (cv.width / 4) * 3, 20);

	// draw usernames beneath the score
	context.font = "1em SixtyFour";
	context.fillText("player 1", cv.width / 4, 60);
	context.fillText("player 2", (cv.width / 4) * 3, 60);

	context.fillStyle = 'white';
	context.beginPath();
	context.arc(cv.width / 2 + 5, cv.height / 2, 100, 0, Math.PI * 2);
	context.strokeStyle = 'white';
	context.lineWidth = 5;
	context.stroke();
	context.closePath();
	// context.drawImage(image, 0, 0, cv.width, cv.height);
}

function draw(currentTime: number)
{
	const delta = (currentTime - lastTime) / 15;
	lastTime = currentTime;
	if (ball.starting === true)
		resetBall(ball);
	draw_bg();
	hit_paddle(ball);	// if the ball touched a paddle
	if (ball.y + ball.speed > cv.height - ball.r || ball.y + ball.speed < ball.r)	// ball hit the top or bottom boundaries
		ball.yVel *= -1;
	const wherehit = hit_wall(ball);
	if (wherehit == 'right')
	{
		let current = p1_score.innerHTML;
		p1_score.innerHTML = (parseInt(current) + 1).toString();
		// start_game(ball, left_paddle, right_paddle);
		resetBall(ball);
		ball.first_collision = false;
	}
	if (wherehit == 'left')
	{
		let current = p2_score?.innerHTML;
		p2_score.innerHTML = (parseInt(current) + 1).toString();
		// start_game(ball, left_paddle, right_paddle);
		resetBall(ball);
		ball.first_collision = false;
	}
	drawPaddle(left_paddle, delta);
	drawPaddle(right_paddle, delta);
	drawBall(ball, delta);
	requestAnimationFrame(draw);
}

function keyDownHandler(event: any)
{
	if (event.key == 'ArrowUp')
		right_paddle.up = true;
	else if (event.key == 'ArrowDown')
		right_paddle.down = true;
	if (event.key == 'w' || event.key == 'W')
		left_paddle.up = true;
	else if (event.key == 's' || event.key == 'S')
		left_paddle.down = true;
}

function keyUpHandler(event: any)
{
	if (event.key == 'ArrowUp')
		right_paddle.up = false;
	else if (event.key == 'ArrowDown')
		right_paddle.down = false;
	if (event.key == 'w' || event.key == 'W')
		left_paddle.up = false;
	if (event.key == 's' || event.key == 'S')
		left_paddle.down = false;
}

function drawBall(ball: Ball, delta: number)
{
	context.beginPath();
	// context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
	context.fillStyle = ball.color;
	context.fillRect(ball.x, ball.y, ball.r, ball.r);
	context.fill();
	context.closePath();
	ball.x += ball.xVel * delta;
	ball.y += ball.yVel * delta;
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
// requestAnimationFrame(draw);
draw(lastTime);