export class Member {
	uuid;
	user_info;
	socket;
	game = null;
	is_player = false;

	constructor(socket, user_info) {
		this.socket = socket;
		this.user_info = user_info;
		this.uuid = crypto.randomUUID();
	}

	join(game) {
		if (this.game)
			this.leave();
		game.join(this);
	}

	play(game) {
		if (this.game)
			this.leave();
		game.player_join(this);
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
	time = 0;
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
}

export class Game {
	uuid;
	admin_info;
	bot_game = false;
	started = false;
	setup;
	players = {};		// username -> Member
	specs = {};			// username -> Member
	all = {};			// username -> Member

	constructor(admin_info) {
		this.uuid = crypto.randomUUID();
		this.admin_info = admin_info;
		this.setup = new Setup();
	}

	start_game() {
		if (this.player_count() < 2)
			this.setup.right_player = new Bot("right", this.setup.arena_width, this.setup.arena_height);
		if (this.player_count() < 1)
			this.setup.right_player = new Bot("left", this.setup.arena_width, this.setup.arena_height);
		started = true;
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
			this.player_join(member);
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
	starting;
	moving;
	first_collision;

	constructor(xPos, yPos, speed, radius, c)
	{
		this.x = xPos;
		this.y = yPos;
		this.speed = speed;
		this.init_speed = speed;
		this.r = radius;
		this.color = c;
		this.xVel = speed;
		this.yVel = speed;
		this.starting = true;
		this.moving = false;
		this.first_collision = false;
	}
}

export class Paddle
{
	height;
	width;
	xPos;
	yPos;
	up;
	down;
	speed;

	constructor(h, w, x, y, speed)
	{
		this.height = h;
		this.width = w;
		this.xPos = x;
		this.yPos = y;
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
			this.name = `AI Bot ${crypto.randomUUID().substring(0, 4)}`;
		this.dest_y = arena.height / 2;
		this.difficulty = difficulty;
	}

	update(ball_x, ball_y, ball_xvel, ball_yvel, moving) {
		if (!moving) {
			this.dest_y = this.arena.height / 2;
			return;
		}
		const modifier = 2 - this.difficulty;
		const variation = modifier * (Math.random() + Math.random()) * (0.05 * this.arena.height)
			* (Math.random() > 0.5 ? -1 : 1) * (Math.random() < (0.4 * modifier) ? 1 : 0);
		console.log(variation);
		const intersect = ball_xvel > 0 ? this.arena.width : -this.arena.width;
		const steps = Math.abs(intersect - ball_x) / ball_xvel;
		const dest = Math.abs(ball_y + ball_yvel * steps);
		const reflects = Math.floor(dest / this.arena.height);
		if (reflects % 2 == 0)
			this.dest_y = (dest % this.arena.height) + variation;
		else
			this.dest_y = this.arena.height * (reflects + 1) - (dest % this.arena.height) + variation;
	}

	play() {
		const y = this.paddle.yPos + this.paddle.height / 2;
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