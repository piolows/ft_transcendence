import { randomUUID } from "crypto";
import update_game from "./pong_game.js";

const ONE_SECOND = 1000;
const GAME_FPS = 60;
const FRAME_TIME = ONE_SECOND / GAME_FPS;

function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
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

	join(game, pref=null) {
		if (this.game)
			this.leave();
		let ret = game.join(this, pref);
		if (ret == false)
			this.is_left = false;
		return ret;
	}

	play(game) {
		if (this.game)
			this.leave();
		const ret = game.player_join(this);
		if (ret == false)
			this.is_left = false;
		return ret;
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
			this.ball = new Ball(width / 2 - 8, height / 2 - 8, 10, 16);
	}

	start_game() {
		this.game_over = false;
		this.winner = 0;
		this.p1_score = 0;
		this.p2_score = 0;
		this.time = 0;
		this.reset = 0;
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
		this.reset = 99999;
	}
}

export class Game {
	uuid;
	setup;
	game_name;
	admin_info;
	winner = 0;
	started = false;
	players = {};		// username -> Member
	specs = {};			// username -> Member
	all = {};			// username -> Member

	constructor(admin_info, game_name = "pong") {
		this.uuid = shortUUID();
		this.admin_info = admin_info;
		this.game_name = game_name;
		if (game_name == "pong")
			this.setup = new Setup();
	}

	getPlayer(side) {
		const players = Object.values(this.players);
		if (side == "left") {
			if (players[0] && players[0].is_left)
				return players[0];
			if (players[1] && players[1].is_left)
				return players[1];
		}
		else if (side == "right") {
			if (players[0] && !players[0].is_left)
				return players[0];
			if (players[1] && !players[1].is_left)
				return players[1];
		}
		return undefined;
	}

	start_game() {
		if (this.player_count() < 2)
			this.setup.right_player = new Bot("right", this.setup.arena_width, this.setup.arena_height);
		if (this.player_count() < 1)
			this.setup.left_player = new Bot("left", this.setup.arena_width, this.setup.arena_height);
		this.started = true;
		this.setup.start_game();
	}

	async stop_game() {
		if (this.setup.game_over)
			throw new Error("Game not running");
		this.setup.end_game();
		const players = Object.values(this.players);
		if (players.length > 1) {
			if (this.setup.game_over) {
				try {
					await fetch(`${process.env.USERS_URL}/${players[0].user_info.username}/history`, {
						method: "POST",
						body: {
							game: "pong",
							op_id: players[1].user_info.id,
							winner_id: this.winner == 0 ? -1 : (this.winner == -1 ? this.getPlayer('left') : this.getPlayer('right')),
							time: this.setup.time,
							p1_score: this.setup.p1_score,
							p2_score: this.setup.p2_score,
						}
					});
				} catch (error) {
					console.error(error);
				}
			}
		}
		for (let player of players) {
			this.specs[player.user_info.username] = player;
			delete this.players[player.user_info.username];
		}
		// if (this.tournament_id) {
		// 	fetch(`${process.env.TOURNAMENT_URL}/${req.body.tournament_id}`, {
		// 		method: "POST",
		// 		body: {
		// 			game_over: this.setup.game_over,
		// 			admin: this.admin_info,
		// 			winner: this.winner,
		// 			time: this.setup.time,
		// 			left_player: this.getPlayer('left'),
		// 			right_player: this.getPlayer('right'),
		// 			p1_score: this.setup.p1_score,
		// 			p2_score: this.setup.p2_score,
		// 		}
		// 	}).catch(error => console.log(error));
		// }
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

	player_join(player, pref=null) {
		if (this.players[player.user_info.username])
			throw new Error("Player already in game");
		if (this.player_count() >= 2)
			throw new Error("Max players in current game");
		if (this.game_over)
			throw new Error("Game already over");
		if ((pref == "left" && this.getPlayer("left")) || (pref == "right" && this.getPlayer("right")))
			throw new Error("Seat already taken");
		
		player.is_player = true;
		player.game = this;
		delete this.specs[player.user_info.username];
		this.players[player.user_info.username] = player;
		this.all[player.user_info.username] = player;
		if (!this.getPlayer("left")) {
			player.is_left = true;
			return true;
		}
		else if (!this.getPlayer("right")) {
			player.is_left = false;
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

function game_state(gameObj) {
	const game = gameObj.setup;
	let players = [];
	for (let player of Object.values(gameObj.players)) {
		players.push(player.user_info);
	}
	console.log(players);
	return {
		started: gameObj.started,
		game_over: game.game_over,
		full: (gameObj.player_count() == 2),
		winner: gameObj.winner,
		time: game.time,
		left_player: players[0] && players[0].is_left ? players[0] : players[1],
		right_player: players[0] && players[0].is_left ? players[1] : players[0],
		timeout: game.timeout,
		reset: game.reset,
		p1_score: game.p1_score,
		p2_score: game.p2_score,
		admin: gameObj.admin_info,
		spec_count: gameObj.spec_count(),
		// tournament_id: gameObj.tournament_id,
		left_paddle: {
			y: game.left_player.paddle.y,
		},
		right_paddle: {
			y: game.right_player.paddle.y,
		},
		ball: {
			x: game.ball.x,
			y: game.ball.y,
			moving: game.ball.moving,
		}
	};
}

function game_frame(gameObj, frame_start) {
	const game = gameObj.setup;
	const gameState = game_state(gameObj);
	if (game.last_second != 0 && frame_start - game.last_second >= ONE_SECOND) {
		game.last_second = frame_start;
		game.time += 1;
		game.timeout = Math.max(0, game.timeout - 1);
		if (game.timeout == 0)
			game.reset = Math.max(0, game.reset - 1);
	}
	if (game.last_bot_second != 0 && frame_start - game.last_bot_second >= ONE_SECOND) {
		game.last_bot_second = frame_start;
		if (game.left_player.type == "bot")
			game.left_player.update(gameState);
		if (game.right_player.type == "bot")
			game.right_player.update(gameState);
	}
	const ended = game.game_over;
	update_game(game);
	if (!ended && game.game_over) {
		gameObj.stop_game();
	}
}

export function broadcast_game(game, is_msg, user_info, msg) {
	const gameState = game_state(game);
	for (const member of Object.values(game.all)) {
		if (!is_msg)
			member.socket.send(JSON.stringify(gameState));
		else
			member.socket.send(JSON.stringify({user: user_info, message: msg}));
	}
}

export function repeated_updates(games) {
	const frame_start = performance.now();
	for (const game of Object.values(games)) {
		if (!game.started || game.setup.game_over)
			continue ;
		game_frame(game, frame_start);
		broadcast_game(game);
	}
	const exec_time = performance.now() - frame_start;
	const delay = Math.max(0, FRAME_TIME - exec_time);
	setTimeout(() => { repeated_updates(games); }, delay);
}

export function destroy_game(admins, games, id) {
	console.log(`Destroyed room #${games[id].uuid}`);
	for (const member of Object.values(games[id].all)) {
		member.socket.send(JSON.stringify({ game_over: true, exit: true }));
		member.game = null;
		member.socket.close();
	}
	delete admins[games[id].admin_info.username];
	delete games[id];
}