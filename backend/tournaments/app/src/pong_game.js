function hit_wall(arena, ball)
{
	if (ball.x + ball.speed > arena.width - ball.r)
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

function resetBall(arena, ball)
{
	ball.x = arena.width / 2 - ball.r / 2;
	ball.y = arena.height / 2 - ball.r / 2;
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

function hit_paddle(paddle, ball, is_left = false)
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

export function start_game(arena, ball, left_player, right_player, game) {
	let animationId;
	const left_paddle = left_player.paddle;
	const right_paddle = right_player.paddle;
	game.time = 0;
	let lastTime = performance.now();
	let lastSecond = performance.now();
	let lastSecondBot = performance.now();

	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

	function draw(currentTime)
	{
		const delta = (currentTime - lastTime) / 15;
		lastTime = currentTime;
		if (ball.starting === true)
		{
			lastSecondBot = currentTime - 900;
			resetBall(arena, ball);
		}
		draw_bg(arena, p1_score, p2_score, left_player.name, right_player.name);
		hit_paddle(left_paddle, ball, true);	// if the ball touched a paddle
		hit_paddle(right_paddle, ball);	// if the ball touched a paddle
		if (ball.y + ball.speed > arena.height - ball.r || ball.y + ball.speed < ball.r)	// ball hit the top or bottom boundaries
			ball.yVel *= -1;
		const wherehit = hit_wall(arena, ball);
		if (wherehit == 'right')
		{
			let current = p1_score.innerHTML;
			p1_score.innerHTML = (parseInt(current) + 1).toString();
			lastSecondBot = currentTime - 900;
			resetBall(arena, ball);
			ball.first_collision = false;
		}
		if (wherehit == 'left')
		{
			let current = p2_score?.innerHTML;
			p2_score.innerHTML = (parseInt(current) + 1).toString();
			lastSecondBot = currentTime - 900;
			resetBall(arena, ball);
			ball.first_collision = false;
		}
		// Runs every second
		if (currentTime - lastSecond >= 1000)
		{
			const seconds = parseInt(secs.innerHTML);
			secs.innerHTML = getTimePlus(secs.innerHTML);
			if (seconds == 59)
				mins.innerHTML = getTimePlus(mins.innerHTML);
			lastSecond = currentTime;
		}
		if (currentTime - lastSecondBot >= 1000)
		{
			lastSecondBot = currentTime;
			if (right_player.type == "bot")
				right_player.update(ball.x, ball.y, ball.xVel, ball.yVel, ball.moving);
		}
		if (right_player.type == "bot")
			right_player.play();
		drawPaddle(arena, left_paddle, delta);
		drawPaddle(arena, right_paddle, delta);
		drawBall(arena, ball, delta);
		animationId = requestAnimationFrame(draw);
	}

	animationId = requestAnimationFrame(draw);

	// Return a controller to stop the game
	return () => {
			cancelAnimationFrame(animationId);
			document.removeEventListener('keydown', keyDownHandler);
			document.removeEventListener('keyup', keyUpHandler);
		};
}
