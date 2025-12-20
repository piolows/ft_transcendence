import { Member, Game, destroy_game, repeated_updates, broadcast_game } from "../modules/pong_classes.js";
import "dotenv/config";

const pongHandler = (fastify, options, done) => {
	let games = {};		//game.uuid -> game
	let admins = {};	//username -> game

	const authenticate = async (req) => {
		try {
			const URL = process.env.AUTH_URL + "/me";
			const headers = {'cookie': req.headers['cookie']};
			const response = await fetch(URL, {
				headers
			});
			if (!response.ok)
				return { success: false, code: response.status, source: "/pong:authenticate", error: "Authentication failed" };
			const data = await response.json();
			if (data && !data.loggedIn)
				return { success: false, code: 403, source: "/pong:authenticate", error: "Must be signed in" };
			return data;
		} catch (error) {
			console.log("COULD NOT AUTHENTICATE:", error);
				return { success: false, code: 500, source: "/pong:authenticate", error: "Authentication Error. Check logs." };
		}
	}

	const delayed_closure = (id, uuid) => {
		if (games[id] && Object.keys(games[id].all).length == 0 && !games[id].setup.game_over) {
			const func = () => {
				if (games[id] && Object.keys(games[id].all).length == 0) {
					destroy_game(admins, games, id);
				}
			};
			setTimeout(func, 10000);
		}
		else {
			destroy_game(admins, games, id);
		}
	}

	fastify.get("/room/:room_id", async (req, resp) => {
		const login_data = await authenticate(req);
		if (!login_data.success)
			return resp.send(login_data);
		const room_code = (req.params.room_id ?? "").toUpperCase();
		const room_code_regex = /^[A-Z0-9]{5}$/;
		if (!room_code_regex.test(room_code)) {
			return resp.send({ success: false, code: 400, source: "/pong/room/:room_id", error: "Invalid room code" });
		}
		if (!games[room_code])
			return resp.send({ success: false, code: 404, source: "/pong/room/:room_id", error: "Room not found"});
		return resp.send({ 
			success: true,
			started: games[room_code].started,
			game_over: games[room_code].setup.game_over,
			winner: games[room_code].winner,
			p1_score: games[room_code].setup.p1_score,
			p2_score: games[room_code].setup.p2_score,
			time: games[room_code].setup.time,
			full: (games[room_code].player_count() == 2),
			admin: games[room_code].admin_info,
			left_player: games[room_code].getPlayer('left'),
			right_player: games[room_code].getPlayer('right'),
			canvas_info: {
				width: games[room_code].setup.arena_width,
				height: games[room_code].setup.arena_height,
			},
			paddle_info: {
				width: games[room_code].setup.left_player.paddle.width,
				height: games[room_code].setup.left_player.paddle.height,
				x: games[room_code].setup.left_player.paddle.x,
				y: games[room_code].setup.left_player.paddle.y,
			},
			ball_info: {
				x: games[room_code].setup.ball.x,
				y: games[room_code].setup.ball.y,
				r: games[room_code].setup.ball.r,
			},
			spec_count: games[room_code].spec_count(),
			tournament_id: games[room_code].tournament_id,
		});
	});

	fastify.post("/new", async (req, resp) => {
		if (Object.keys(games).length > 1024)
			return resp.send({ success: false, code: 501, source: "/pong/new", error: "Maximum game limit reached" });
		const login_data = await authenticate(req);
		if (!login_data.success)
			return resp.send(login_data);
		if (admins[login_data.user.username])
			return resp.send({ success: false, code: 403, source: "/pong/new", error: "User already has an open room" });
		let id = -1;
		if (typeof req.body !== 'undefined' && typeof req.body.tournament_id !== "undefined") {
			try {
				fastify.log.info(`sending fetch request to ${process.env.TOURNAMENT_URL}/${req.body.tournament_id}`);
				const result = await fetch(`${process.env.TOURNAMENT_URL}/${req.body.tournament_id}`);
				const data = await result.json();
				const { uuid, game_uuid } = data;
				id = uuid;
			} catch (error) {
				fastify.log.error(`error fetching tournament info: ${error.message}`);
				return resp.send({ success: false, code: 500, source: "/pong/new", error: error });
			}
		}
		// const game = new Game(login_data.user, req.body.tournament_id);
		const game = new Game(login_data.user, id);
		games[game.uuid] = game;
		admins[login_data.user.username] = game;
		console.log(`${login_data.user.username} created room ${game.uuid}`);
		return resp.send({ success: true, game_id: game.uuid});
	});

	fastify.post("/destroy", async (req, resp) => {
		const login_data = await authenticate(req);
		if (!login_data.success)
			return resp.send(login_data);
		if (admins[login_data.user.username]) {
			destroy_game(admins, games, admins[login_data.user.username].uuid);
		}
		return resp.send({ success: true });
	});

	fastify.get("/", {
		websocket: true,
		preValidation: async (req, reply, done) => {
				const login_data = await authenticate(req);
				if (!login_data.success)
					return reply.send(JSON.stringify(login_data));
				done();
			}
		}, async (socket, req) => {
			const login_data = await authenticate(req);
			if (!login_data.success)
				return reply.send(login_data);
			const member = new Member(socket, login_data.user);

			console.log(`New user connected to socket: ${member.uuid} - ${member.user_info.username} - ${member.user_info.email}`);

			socket.on('message', (msg) => {
				let data;
				try {
					data = JSON.parse(msg);
				} catch (err) {
					socket.send(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid JSON" }));
					return;
				}

				let { game_id, action, param } = data;
				if (game_id)
					game_id = game_id.toUpperCase();

				//============ TEMPORARY FOR TESTING =============//
				const getinfo = (guy) => {if (!guy) return ''; return `${guy.email} - ${guy.username}\n`;}
				const getinfos = (guys) => {if (!guys) return ''; let ret = ""; for (const guy of guys) ret += getinfo(guy.user_info) + "  "; return ret;}
				if (action == "INFO") {
					for (const game of Object.values(games)) {
						socket.send(`Game #${game.uuid} has admin ${getinfo(game.admin_info)}.\nSpectators:\n${getinfos(Object.values(game.specs))}\nPlayers:\n${getinfos(Object.values(game.players))}`);
						console.log(`Game #${game.uuid} has admin ${getinfo(game.admin_info)}.\nSpectators:\n${getinfos(Object.values(game.specs))}\nPlayers:\n${getinfos(Object.values(game.players))}`);
					};
					return;
				}
				if (action == "START") {
					games[game_id].start_game();
					// socket.send(`Game #${game_id} started.`);
					console.log(`Game #${game_id} started.`);
					return;
				}
				//============ TEMPORARY FOR TESTING =============//

				if (!game_id || !action) {
					socket.send(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid message: Must contain game_id & action [& param]" }));
					return;
				}
				if (!games[game_id]) {
					socket.send(JSON.stringify({ success: false, code: 404, source: "/pong:socket.onmessage", error: "Game not found" }));
					return;
				}
				try {
					switch (action) {
						case "JOIN":
							if (param && param != "SPEC" && param != "EITHER") {
								socket.send(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								console.log(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								break;
							}
							else if (param && param == "SPEC") {
								member.spec(games[game_id]);
								// socket.send(`Joined game #${game_id} as a spectator!`);
								console.log(`User ${member.user_info.username} - ${member.user_info.email} Joined game #${game_id} as a spectator!`);
								socket.send(JSON.stringify({ success: true, role: "spectator" }));
							}
							else {
								const ret = member.join(games[game_id]);
								if (ret == true) {
									socket.send(JSON.stringify({ success: true, role: "left_player" }));
									// socket.send(`Joined game #${game_id} as the left player!`);
									console.log(`User ${member.user_info.username} - ${member.user_info.email} joined game #${game_id} as the left player`);
								}
								else if (ret == false) {
									socket.send(JSON.stringify({ success: true, role: "right_player" }));
									// socket.send(`Joined game #${game_id} as the right player!`);
									console.log(`User ${member.user_info.username} - ${member.user_info.email} joined game #${game_id} as the right player`);
								}
								else {
									socket.send(JSON.stringify({ success: true, role: "spectator" }));
									// socket.send(`Joined game #${game_id} as a spectator!`);
									console.log(`User ${member.user_info.username} - ${member.user_info.email} joined game #${game_id} as a player`);
								}
							}
							if (!games[game_id].started && games[game_id].player_count() == 2) {
								games[game_id].start_game();
								console.log(`Game #${game_id} started!`);
							}
							break;
						case "PLAY":
							if (param && param != "LEFT" && param != "RIGHT") {
								socket.send(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid message param: PLAY only takes LEFT/RIGHT as optional params." }));
								console.log(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid message param: PLAY only takes LEFT/RIGHT as optional params." }));
								break;
							}
							const players = Object.values(games[game_id].players);
							if (players.length >= 2)
								socket.send(JSON.stringify({ success: false, code: 403, source: "/pong:socket.onmessage", error: "Game room is full" }));
							if (param && param == "LEFT") {
								if (players.length == 1 && players[0].is_left) {
									socket.send(JSON.stringify({ success: false, code: 403, source: "/pong:socket.onmessage", error: "Seat 1 is already taken" }));
									return ;
								}
								member.join(games[game_id], "left");
								socket.send(JSON.stringify({ success: true, role: "left_player" }));
								console.log(`User ${member.user_info.username} - ${member.user_info.email} Joined game #${game_id} as the left player`);
							}
							else if (param && param == "LEFT") {
								if (players.length == 1 && !players[0].is_left) {
									socket.send(JSON.stringify({ success: false, code: 403, source: "/pong:socket.onmessage", error: "Seat 2 is already taken" }));
									return ;
								}
								member.join(games[game_id], "right");
								socket.send(JSON.stringify({ success: true, role: "right_player" }));
								console.log(`User ${member.user_info.username} - ${member.user_info.email} Joined game #${game_id} as the right player`);
							}
							else {
								const ret = member.join(games[game_id]);
								if (ret == true) {
									socket.send(JSON.stringify({ success: true, role: "left_player" }));
									// socket.send(`Joined game #${game_id} as the left player!`);
									console.log(`User ${member.user_info.username} - ${member.user_info.email} joined game #${game_id} as the left player`);
								}
								else if (ret == false) {
									socket.send(JSON.stringify({ success: true, role: "right_player" }));
									// socket.send(`Joined game #${game_id} as the right player!`);
									console.log(`User ${member.user_info.username} - ${member.user_info.email} joined game #${game_id} as the right player`);
								}
							}
							if (!games[game_id].started && games[game_id].player_count() == 2) {
								games[game_id].start_game();
								console.log(`Game #${game_id} started!`);
							}
							break;
						case "LEAVE":
							if (!member.game) {
								socket.send(JSON.stringify({ success: false, code: 403, source: "/pong:socket.onmessage", error: `User is not in a game` }));
								break;
							}
							const gid = member.game.uuid;
							if (gid != game_id) {
								socket.send(JSON.stringify({ success: false, code: 403, source: "/pong:socket.onmessage", error: `Wrong game ID. User is in game #${gid}` }));
								break;
							}
							member.leave();
							console.log(`User ${member.user_info.username} - ${member.user_info.email} left game #${gid}`);
							socket.send(JSON.stringify({ success: true }));
							break;
						case "MOVE_UP":
							if (member.is_left) {
								games[game_id].setup.left_player.paddle.up = true;
								games[game_id].setup.left_player.paddle.down = false;
							}
							else {
								games[game_id].setup.right_player.paddle.up = true;
								games[game_id].setup.right_player.paddle.down = false;
							}
							break;
						case "MOVE_DOWN":
							if (member.is_left) {
								games[game_id].setup.left_player.paddle.up = false;
								games[game_id].setup.left_player.paddle.down = true;
							}
							else {
								games[game_id].setup.right_player.paddle.up = false;
								games[game_id].setup.right_player.paddle.down = true;
							}
							break;
						case "STOP":
							if (member.is_left) {
								games[game_id].setup.left_player.paddle.up = false;
								games[game_id].setup.left_player.paddle.down = false;
							}
							else {
								games[game_id].setup.right_player.paddle.up = false;
								games[game_id].setup.right_player.paddle.down = false;
							}
							break;
						case "MESSAGE":
							if (!param || param.trim() == "") {
								socket.send(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid message action: no param variable with message" }));
								break;
							}
							// socket.send("You said: " + param);
							break;
						default:
							socket.send(JSON.stringify({ success: false, code: 400, source: "/pong:socket.onmessage", error: "Invalid action. Available actions: JOIN/PLAY/LEAVE/MOVE_UP/MOVE_DOWN/STOP/MESSAGE" }));
							break;
					}
					if (!games[game_id].started || action == "MESSAGE") {
						broadcast_game(games[game_id], action == "MESSAGE", member.user_info);
					}
				} catch (err) {
					console.log("Error on command: ", err.message);
					socket.send(JSON.stringify({ success: false, code: 500, source: "/pong:socket.onmessage", error: err.message }));
				}
			});

			socket.on('close', () => {
				console.log(`User ${member.uuid} - ${member.user_info.username} - ${member.user_info.email} has disconnected from the socket.`);
				try {
					if (member.game) {
						const id = member.game.uuid;
						console.log(`~User ${member.user_info.username} - ${member.user_info.email} left game #${id}`);
						if (games[id].player_count() == 0 && (Object.keys(games[id].all).length == 0 || games[id].setup.game_over)) {
							delayed_closure(id);
						}
						else {
							broadcast_game(games[id], false, null);
						}
					}
				} catch (err) {
					console.log("Error on close: ", err.message);
				}
			});
	});

	repeated_updates(games);
	done();
};

export default pongHandler;