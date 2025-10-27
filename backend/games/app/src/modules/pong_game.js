function hit_walls(arena_width, arena_height, ball)
{
	if (ball.y + ball.yVel - ball.r < 0) {
		ball.yVel *= -1;
		return ('top');
	}
	if (ball.y + ball.yVel + ball.r > arena_height) {
		ball.yVel *= -1;
		return ('bottom');
	}
	if (ball.x + ball.xVel + ball.r > arena_width)
	{
		ball.xVel *= -1;
		return ('right');
	}
	if (ball.x + ball.xVel - ball.r < 0)
	{
		ball.xVel *= -1;
		return ('left');
	}
	// if (ball.y + ball.speed - ball.r < 0) {
	// 	ball.yVel *= -1;
	// 	return ('top');
	// }
	// if (ball.y + ball.speed + ball.r > arena_height) {
	// 	ball.yVel *= -1;
	// 	return ('bottom');
	// }
	// if (ball.x + ball.speed + ball.r > arena_width)
	// {
	// 	ball.xVel *= -1;
	// 	return ('right');
	// }
	// if (ball.x + ball.speed - ball.r < 0)
	// {
	// 	ball.xVel *= -1;
	// 	return ('left');
	// }
	return ('none');
}

function resetBall(game, ball)
{
	const LESS_THAN_A_SECOND = 900;

	game.reset = 3;
	game.last_bot_second = performance.now() - LESS_THAN_A_SECOND;
	ball.x = game.arena_width / 2 - ball.r / 2;
	ball.y = game.arena_height / 2 - ball.r / 2;
	ball.xVel = 0;
	ball.yVel = 0;
	ball.speed = ball.init_speed;
	ball.moving = false;
}

function hit_paddle(paddle, ball, is_left = false)
{
	const future_pos = ball.x + ball.xVel + (is_left ? -ball.r : ball.r);
	if (ball.y + ball.yVel >= paddle.y && ball.y + ball.yVel <= paddle.y + paddle.height)
	{
		if ((is_left && future_pos < paddle.x + paddle.width) 
		|| (!is_left && future_pos > paddle.x))
		{
			const center = paddle.y + paddle.height / 2;
			const normal_intersect = (ball.y - center) / (paddle.height / 2);
			const angle = normal_intersect * (Math.PI / 4);
			ball.xVel = ball.speed * Math.cos(angle);
			ball.yVel = ball.speed * Math.sin(angle);
			// ball.speed *= 1.05;
			if (!is_left)
				ball.xVel *= -1;
		}
	}
	// const future_pos = ball.x + ball.speed + (is_left ? -ball.r : ball.r);
	// if (ball.y >= paddle.y && ball.y <= paddle.y + paddle.height)
	// {
	// 	if ((is_left && future_pos < paddle.x + paddle.width) 
	// 	|| (!is_left && future_pos > paddle.x))
	// 	{
	// 		const center = paddle.y + paddle.height / 2;
	// 		const normal_intersect = (ball.y - center) / (paddle.height / 2);
	// 		const angle = normal_intersect * (Math.PI / 4);
	// 		ball.xVel = ball.speed * Math.cos(angle);
	// 		ball.yVel = ball.speed * Math.sin(angle);
	// 		// ball.speed *= 1.05;
	// 		if (!is_left)
	// 			ball.xVel *= -1;
	// 	}
	// }
}

export default function update_game(game) {
	const ball = game.ball;
	const left_paddle = game.left_player.paddle;
	const right_paddle = game.right_player.paddle;
	const arena_width = game.arena_width;
	const arena_height = game.arena_height;
	const p1_score = game.p1_score;
	const p2_score = game.p2_score;

	if (game.last_second == 0)
		game.last_second = performance.now();
	if (game.last_bot_second == 0)
		game.last_bot_second = performance.now();

	// Game over condition
	if (game.time >= game.max_time || p1_score >= game.max_score || p2_score >= game.max_score) {
		game.winner = (p1_score > p2_score ? 1 : (p1_score < p2_score ? -1 : 0));
		game.end_game();
		return ;
	}

	// Game is put in timeout (typically for resetting ball)
	if (game.timeout > 0) {
		ball.moving = false;
		return ;
	}
	else if (!ball.moving && game.reset == 0) {
		const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // -22.5° to +22.5°
		const direction = Math.random() < 0.5 ? 1 : -1; // left or right
		
		ball.xVel = direction * ball.speed * Math.cos(angle);
		ball.yVel = ball.speed * Math.sin(angle);
		ball.moving = true;
	}
	
	// Move paddles and ball
	if (left_paddle.up)
		left_paddle.y = Math.max(left_paddle.y - left_paddle.speed, 0);
	if (left_paddle.down)
		left_paddle.y = Math.min(left_paddle.y + left_paddle.speed, arena_height - left_paddle.height);
	if (right_paddle.up)
		right_paddle.y = Math.max(right_paddle.y - right_paddle.speed, 0);
	if (right_paddle.down)
		right_paddle.y = Math.min(right_paddle.y + right_paddle.speed, arena_height - right_paddle.height);
	if (game.reset > 0)
		return ;
	ball.x += ball.xVel;
	ball.y += ball.yVel;

	// Check collision with paddles
	hit_paddle(left_paddle , ball, true);
	hit_paddle(right_paddle, ball);

	// Check collision with walls
	const wherehit = hit_walls(arena_width, arena_height, ball);
	if (wherehit == 'right')
	{
		game.p2_score += 1;
		resetBall(game, ball);
	}
	if (wherehit == 'left')
	{
		game.p1_score += 1;
		resetBall(game, ball);
	}
}

