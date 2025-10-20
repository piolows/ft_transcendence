import { randomUUID } from "crypto";
import update_game from "./pong_game.js";

const ONE_SECOND = 1000;
const GAME_FPS = 2;
const FRAME_TIME = ONE_SECOND / GAME_FPS;

function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
}

export class Member {
	uuid;
	user_info;
	socket;
	game = null;
	is_player = false;
	is_left = true;

	constructor(socket, user_info) {
		this.socket = socket;
		this.user_info = user_info;
		this.uuid = shortUUID();
	}

	join(game) {
		if (this.game)
			this.leave();
		return game.join(this);
	}

	play(game) {
		if (this.game)
			this.leave();
		return game.player_join(this);
	}

	spec(game) {
		if (this.game)
			this.leave();
		game.spec_join(this);
	}

	leave() {
		if (!this.game) {
			throw new Error("User not in a game");
		}
		if (this.is_player)
			this.game.player_leave(this);
		else
			this.game.spec_leave(this);
	}
}

class Setup {
	arena_width;
	arena_height;
	max_score;
	max_time;
	left_player;
	right_player;
	ball;
	p1_score = 0;
	p2_score = 0;
	last_second = 0;
	last_bot_second = 0;
	time = 0;
	timeout = 0;
	game_over = false;

	constructor(width = 800, height = 600, max_score = 10, max_time = 600, ball = null, lplayer = null, rplayer = null) {
		this.arena_width = width;
		this.arena_height = height;
		this.max_score = max_score;
		this.max_time = max_time;
		if (lplayer)
			this.left_player = lplayer;
		else
			this.left_player = new Player("left", width, height);
		if (rplayer)
			this.right_player = rplayer;
		else
			this.right_player = new Player("right", width, height);
		if (ball)
			this.ball = ball;
		else
			this.ball = new Ball(width / 2, height / 2, 10, 16);
	}

	start_game() {
		this.game_over = false;
		this.winner = 0;
		this.p1_score = 0;
		this.p2_score = 0;
		this.time = 0;
		this.timeout = 3;
		this.last_bot_second = 0;
		this.last_second = 0;
		this.left_player.paddle.y = this.arena_height / 2;
		this.right_player.paddle.y = this.arena_height / 2;
	}

	end_game() {
		this.game_over = true;
		this.left_player.paddle.y = this.arena_height / 2;
		this.right_player.paddle.y = this.arena_height / 2;
		this.last_bot_second = 0;
		this.last_second = 0;
		this.timeout = 99999;
	}
}

export class Game {
	uuid;
	admin_info;
	setup;
	winner = 0;
	started = false;
	lp_member = null;
	rp_member = null;
	players = {};		// username -> Member
	specs = {};			// username -> Member
	all = {};			// username -> Member

	constructor(admin_info) {
		this.uuid = shortUUID();
		this.admin_info = admin_info;
		this.setup = new Setup();
	}

	start_game() {
		if (this.player_count() < 2)
			this.setup.right_player = new Bot("right", this.setup.arena_width, this.setup.arena_height);
		if (this.player_count() < 1)
			this.setup.left_player = new Bot("left", this.setup.arena_width, this.setup.arena_height);
		this.started = true;
		this.setup.start_game();
	}

	stop_game() {
		if (!this.stop_game)
			throw new Error("Game not running");
		this.setup.end_game();
		this.lp_member = null;
		this.rp_member = null;
		for (let player of Object.values(this.players)) {
			this.specs[player.user_info.username] = player;
			delete this.players[player.user_info.username];
		}
	}

	player_count() {
		return Object.keys(this.players).length;
	}

	spec_count() {
		return Object.keys(this.specs).length;
	}

	join(member) {
		if (this.all[member.user_info.username])
			throw new Error("User already in game");
		if (this.player_count() == 2)
			this.spec_join(member);
		else
			return this.player_join(member);
	}

	player_join(player) {
		if (this.players[player.user_info.username])
			throw new Error("Player already in game");
		if (this.player_count() == 2)
			throw new Error("Max players in current game");
		if (this.game_over)
			throw new Error("Game already over");
		player.is_player = true;
		player.game = this;
		delete this.specs[player.user_info.username];
		this.players[player.user_info.username] = player;
		this.all[player.user_info.username] = player;
		if (!this.lp_member) {
			this.lp_member = player;
			return true;
		}
		else if (!this.rp_member) {
			this.rp_member = player;
			return false;
		}
		else
			throw new Error("Max players in current game");
	}

	spec_join(spec) {
		spec.game = this;
		spec.is_player = false;
		delete this.players[spec.user_info.username];
		this.specs[spec.user_info.username] = spec;
		this.all[spec.user_info.username] = spec;
	}

	player_leave(player) {
		if (!this.players[player.user_info.username])
			throw new Error("Player not in this game");
		this.players[player.user_info.username].game = null;
		this.players[player.user_info.username].is_player = false;
		delete this.players[player.user_info.username];
		delete this.all[player.user_info.username];
	}

	spec_leave(spec) {
		if (!this.specs[spec.user_info.username])
			throw new Error("User not in this game");
		delete this.specs[spec.user_info.username];
		delete this.all[spec.user_info.username];
	}
}

export class Ball
{
	x;
	y;
	xVel;
	yVel;
	speed;
	init_speed;
	r;
	moving;

	constructor(x, y, speed, radius, c)
	{
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.init_speed = speed;
		this.r = radius;
		this.color = c;
		this.xVel = speed;
		this.yVel = speed;
		this.moving = false;
	}
}

export class Paddle
{
	height;
	width;
	x;
	y;
	up;
	down;
	speed;

	constructor(h, w, x, y, speed)
	{
		this.height = h;
		this.width = w;
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.up = false;
		this.down = false;
	}
};

export class Player {
	type = "player";
	arena_height;
	arena_width;
	side;
	paddle;

	constructor(side, arena_width, arena_height, paddle = null) {
		this.side = side;
		this.arena_width = arena_width;
		this.arena_height = arena_height;
		if (paddle)
			this.paddle = paddle;
		else {
			if (side == "left")
				this.paddle = new Paddle(90, 20, 20, (arena_height - 90) / 2, 10);
			else
				this.paddle = new Paddle(90, 20, arena_width - (20 * 2), (arena_height - 90) / 2, 10);
		}
	}
}

export class Bot extends Player {
	name;
	dest_y;
	difficulty;
	type = "bot";

	constructor(side, arena_width, arena_height, name = null, paddle = null, difficulty = 1) {
		super(side, arena_width, arena_height, paddle);
		if (name)
			this.name = name;
		else
			this.name = `AI Bot ${shortUUID().substring(0, 4)}`;
		this.dest_y = arena_height / 2;
		this.difficulty = difficulty;
	}

	update(gameState) {
		const ball_x = gameState.ball.x;
		const ball_y = gameState.ball.y;
		const ball_xVel = gameState.ball.xVel;
		const ball_yVel = gameState.ball.yVel;
		const moving = gameState.moving;
		if (!moving) {
			this.dest_y = this.arena_height / 2;
			return;
		}
		const modifier = 2 - this.difficulty;
		const variation = modifier * (Math.random() + Math.random()) * (0.05 * this.arena_height)
			* (Math.random() > 0.5 ? -1 : 1) * (Math.random() < (0.4 * modifier) ? 1 : 0);
		const intersect = ball_xVel > 0 ? this.arena_width : -this.arena_width;
		const steps = Math.abs(intersect - ball_x) / ball_xVel;
		const dest = Math.abs(ball_y + ball_yVel * steps);
		const reflects = Math.floor(dest / this.arena_height);
		if (reflects % 2 == 0)
			this.dest_y = (dest % this.arena_height) + variation;
		else
			this.dest_y = this.arena_height * (reflects + 1) - (dest % this.arena_height) + variation;
	}

	play() {
		const y = this.paddle.y + this.paddle.height / 2;
		const diff = this.paddle.speed / 2;
		if (y < this.dest_y - diff)
			this.paddle.down = true;
		else
			this.paddle.down = false;
		if (y > this.dest_y + diff)
			this.paddle.up = true;
		else
			this.paddle.up = false;
	}
}

function game_state(game) {
	return {
		started: game.started,
		full: (game.player_count() == 2),
		time: game.time,
		players: game.players,
		game_over: game.game_over,
		timeout: game.timeout,
		p1_score: game.p1_score,
		p2_score: game.p2_score,
		admin: game.admin_info,
		spec_count: game.spec_count(),
		left_paddle: {
			y: game.left_player.paddle.y,
			speed: game.left_player.paddle.speed
		},
		right_paddle: {
			y: game.right_player.paddle.y,
			speed: game.right_player.paddle.speed
		},
		ball: {
			x: game.ball.x,
			y: game.ball.y,
			xVel: game.ball.xVel,
			yVel: game.ball.yVel,
			speed: game.ball.speed,
			moving: game.ball.moving,
		}
	};
}

function game_frame(game, frame_start) {
	const gameState = game_state(game);
	if (game.last_second != 0 && frame_start - game.last_second >= ONE_SECOND) {
		game.last_second = frame_start;
		game.time += 1;
		game.timeout = Math.max(0, game.timeout - 1);
	}
	if (game.last_bot_second != 0 && frame_start - game.last_bot_second >= ONE_SECOND) {
		game.last_bot_second = frame_start;
		if (game.left_player.type == "bot")
			game.left_player.update(gameState);
		if (game.right_player.type == "bot")
			game.right_player.update(gameState);
	}
	update_game(game);
}

function broadcast_game(game) {
	const gameState = game_state(game.setup);
	for (const member of Object.values(game.all)) {
		member.socket.send(JSON.stringify(gameState));
	}
}

export function repeated_updates(games) {
	const frame_start = performance.now();
	for (const game of Object.values(games)) {
		if (!game.started || game.setup.game_over)
			continue ;
		game_frame(game.setup, frame_start);
		broadcast_game(game);
	}
	const exec_time = performance.now() - frame_start;
	const delay = Math.max(0, FRAME_TIME - exec_time);
	setTimeout(() => { repeated_updates(games); }, delay);
}

export function destroy_game(admins, games, id) {
	for (const member of Object.values(games[id].all)) {
		member.socket.send(JSON.stringify({ game_over: true, exit: true }));
		member.game = null;
		member.socket.close();
	}
	delete admins[games[id].admin_info.username];
	delete games[id];
}