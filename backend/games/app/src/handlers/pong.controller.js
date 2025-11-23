import { Member, Game, destroy_game, repeated_updates, broadcast_game } from "../modules/pong_classes.js";
import "dotenv/config";

const pongHandler = (fastify, options, done) => {
	let games = {};		//game.uuid -> game
	let admins = {};	//username -> game

	fastify.get("/room/:room_id", (req, resp) => {
		if (!req.session || !req.session.user)
			return resp.send({ success: false, code: 403, error: "Must be signed" });
		const room_code = (req.params.room_id ?? "").toUpperCase();
		const room_code_regex = /^[A-Z0-9]{5}$/;
		if (!room_code_regex.test(room_code)) {
			return resp.send({ success: false, code: 400, error: "Invalid room code" });
		}
		if (!games[room_code])
			return resp.send({ success: false, code: 404, error: "Room not found"});
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
			return resp.send({ success: false, code: 501, error: "Maximum game limit reached" });
		if (!req.session || !req.session.user)
			return resp.send({ success: false, code: 403, error: "Must be signed in to create a game" });
		if (admins[req.session.user.username])
			return resp.send({ success: false, code: 403, error: "User already has an open room" });
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
				return resp.send({ success: false, code: 500, error: error.message });
			}
		}
		// const game = new Game(req.session.user, req.body.tournament_id);
		const game = new Game(req.session.user, id);
		games[game.uuid] = game;
		admins[req.session.user.username] = game;
		console.log(`${req.session.user.username} created room ${game.uuid}`);
		return resp.send({ success: true, game_id: game.uuid});
	});

	fastify.post("/destroy", (req, resp) => {
		if (!req.session || !req.session.user)
			return resp.send({ success: false, code: 403, error: "Must be signed in to create a game" });
		if (admins[req.session.user.username]) {
			console.log(`Destroyed room ${admins[req.session.user.username].uuid}`);
			destroy_game(admins, games, admins[req.session.user.username].uuid);
		}
		return resp.send({ success: true });
	});

	fastify.get("/", {
		websocket: true,
		preValidation: (req, reply, done) => {
				if (!req.session || !req.session.user) {
					reply.send({ success: false, code: 403, error: "Must be signed in to join a game" });
					return;
				}
				done();
			}
		}, (socket, req) => {
			const member = new Member(socket, req.session.user);

			console.log(`New user connected to socket: ${member.uuid} - ${member.user_info.username} - ${member.user_info.email}`);

			socket.on('message', (msg) => {
				let data;
				try {
					data = JSON.parse(msg);
				} catch (err) {
					socket.send(JSON.stringify({ success: false, code: 400, error: "Invalid JSON" }));
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
						// socket.send(`Game #${game.uuid} has admin ${getinfo(game.admin_info)}.\nSpectators:\n${getinfos(Object.values(game.specs))}\nPlayers:\n${getinfos(Object.values(game.players))}`);
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
					socket.send(JSON.stringify({ success: false, code: 400, error: "Invalid message: Must contain game_id & action [& param]" }));
					return;
				}
				if (!games[game_id]) {
					socket.send(JSON.stringify({ success: false, code: 404, error: "Game not found" }));
					return;
				}
				try {
					switch (action) {
						case "JOIN":
							if (param && param != "PLAY" && param != "SPEC" && param != "EITHER") {
								socket.send(JSON.stringify({ success: false, code: 400, error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								console.log(JSON.stringify({ success: false, code: 400, error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								break;
							}
							if (param && param == "PLAY") {
								const ret = member.play(games[game_id]);
								// socket.send(`Joined game #${game_id} as ${ret == true ? "the left player!" : "the right player!"}`);
								console.log(`User ${member.user_info.username} - ${member.user_info.email} Joined game #${game_id}`);
								if (ret == true)
									socket.send(JSON.stringify({ success: true, role: "left_player" }));
								else
									socket.send(JSON.stringify({ success: true, role: "right_player" }));
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
						case "JOIN":
							if (param && param != "PLAY" && param != "SPEC" && param != "EITHER") {
								socket.send(JSON.stringify({ success: false, code: 400, error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								console.log(JSON.stringify({ success: false, code: 400, error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								break;
							}
							if (param && param == "PLAY") {
								const ret = member.play(games[game_id]);
								// socket.send(`Joined game #${game_id} as ${ret == true ? "the left player!" : "the right player!"}`);
								console.log(`User ${member.user_info.username} - ${member.user_info.email} Joined game #${game_id}`);
								if (ret == true)
									socket.send(JSON.stringify({ success: true, role: "left_player" }));
								else
									socket.send(JSON.stringify({ success: true, role: "right_player" }));
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
						case "LEAVE":
							if (!member.game) {
								socket.send(JSON.stringify({ success: false, code: 403, error: `User is not in a game` }));
								break;
							}
							const gid = member.game.uuid;
							if (gid != game_id) {
								socket.send(JSON.stringify({ success: false, code: 403, error: `Wrong game ID. User is in game #${gid}` }));
								break;
							}
							member.leave();
							console.log(`User ${member.user_info.username} - ${member.user_info.email} left game #${gid}`);
							// if (games[gid].player_count() == 0 && (Object.keys(games[gid].all).length == 0 || games[gid].setup.game_over)) {
							// 	destroy_game(admins, games, gid);
							// 	console.log(`Destroyed room ${gid}`);
							// }
							// socket.send("Left game #" + gid);
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
								socket.send(JSON.stringify({ success: false, code: 400, error: "Invalid message action: no param variable with message" }));
								break;
							}
							// socket.send("You said: " + param);
							break;
						default:
							socket.send(JSON.stringify({ success: false, code: 400, error: "Invalid action. Available actions: JOIN/PLAY/LEAVE/MOVE_UP/MOVE_DOWN/STOP/MESSAGE" }));
							break;
					}
					if (!games[game_id].started || action == "MESSAGE") {
						broadcast_game(games[game_id], action == "MESSAGE", member.user_info);
					}
				} catch (err) {
					console.log("Error on command: ", err.message);
					socket.send(JSON.stringify({ success: false, code: 500, error: err.message }));
				}
			});

			socket.on('close', () => {
				console.log(`User ${member.uuid} - ${member.user_info.username} - ${member.user_info.email} has disconnected from the socket.`);
				try {
					if (member.game) {
						const id = member.game.uuid;
						member.leave();
						console.log(`User ${member.user_info.username} - ${member.user_info.email} left game #${id}`);
						if (games[id].player_count() == 0 && (Object.keys(games[id].all).length == 0 || games[id].setup.game_over)) {
							// if (Object.keys(games[id].all).length == 0 && !games[id].setup.game_over) {
							// 	const func = () => {
							// 		if (Object.keys(games[id].all).length == 0) {
							// 			destroy_game(admins, games, id);
							// 			console.log(`Destroyed room ${id}`);
							// 		}
							// 	};
							// 	setTimeout(func, 20000);
							// }
							// else {
								destroy_game(admins, games, id);
								console.log(`Destroyed room ${id}`);
							// }
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