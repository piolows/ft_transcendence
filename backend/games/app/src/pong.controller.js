import { Member, Game } from "./pong_classes.js";

const pongHandler = (fastify, options, done) => {
	let games = {};		//game.uuid -> game
	let admins = {};	//username -> game

	fastify.post("/new", (req, resp) => {
		if (Object.keys(games).length > 1024)
			return resp.code(501).send({ status: "failed", error: "Maximum game limit reached" });
		if (!req.session || !req.session.user)
			return resp.code(403).send({ error: "Must be signed in to create a game" });
		if (admins[req.session.user.username])
			return resp.code(403).send({ error: "User already has an open room" });
		const game = new Game(req.session.user);
		games[game.uuid] = game;
		admins[req.session.user.username] = game;
		console.log(`${req.session.user.username} created room ${game.uuid}`);
		return resp.code(200).send({ status: "success", game_id: game.uuid});
	});

	fastify.post("/destroy", (req, resp) => {
		if (Object.keys(games).length > 1024)
			return resp.code(501).send({ status: "failed", error: "Maximum game limit reached" });
		if (!req.session || !req.session.user)
			return resp.code(403).send({ error: "Must be signed in to create a game" });
		if (admins[req.session.user.username])
			console.log(`Destroyed room ${admins[req.session.user.username].uuid}`);
		delete admins[req.session.user.username];
		return resp.code(200).send({ status: "success" });
	});

	fastify.get("/", {
		websocket: true,
		preValidation: (req, reply, done) => {
				if (!req.session || !req.session.user) {
					reply.code(403).send({ error: "Must be signed in to join a game" });
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
					socket.send(JSON.stringify({ error: "Invalid JSON" }));
					return;
				}

				const { game_id, action, param } = data;

				//============ TEMPORARY FOR TESTING =============//
				const getinfo = (guy) => {return `${guy.email} - ${guy.username}\n`;}
				const getinfos = (guys) => {let ret = ""; for (const guy of guys) ret += getinfo(guy.user_info) + "  "; return ret;}
				if (action == "INFO") {
					for (const game of Object.values(games)) {
						socket.send(`Game #${game.uuid} has admin ${getinfo(game.admin)}.\nSpectators:\n${getinfos(Object.values(game.specs))}\nPlayers:\n${getinfos(Object.values(game.players))}`);
						console.log(`Game #${game.uuid} has admin ${getinfo(game.admin)}.\nSpectators:\n${getinfos(Object.values(game.specs))}\nPlayers:\n${getinfos(Object.values(game.players))}`);
					};
					return;
				}
				//============ TEMPORARY FOR TESTING =============//

				if (!game_id || !action) {
					socket.send(JSON.stringify({ error: "Invalid message: Must container game_id & action [& param]" }));
					return;
				}
				if (!games[game_id]) {
					socket.send(JSON.stringify({ error: "Game not found" }));
					return;
				}
				try {
					switch (action) {
						case "JOIN":
							if (param && param != "PLAY" && param != "SPEC") {
								socket.send(JSON.stringify({ error: "Invalid message param: JOIN only takes PLAY/SPEC as optional params." }));
								return;
							}
							if (param && param == "PLAY") {
								member.play(games[game_id]);
								socket.send("Joined game #" + game_id);
							}
							else if (param && param == "SPEC") {
								member.spec(games[game_id]);
								socket.send("Joined game #" + game_id);
							}
							else {
								member.join(games[game_id]);
								socket.send("Joined game #" + game_id);
							}
							console.log(`User ${member.user_info.username} - ${member.user_info.email} joined game #${game_id}`);
							return;
						case "LEAVE":
							const gid = member.game.uuid;
							if (gid != game_id) {
								socket.send(JSON.stringify({ error: `Wrong game ID. User is in game #${gid}` }));
								return;
							}
							member.leave();
							console.log(`User ${member.user_info.username} - ${member.user_info.email} left game #${gid}`);
							if (games[gid].player_count() == 0) {
								delete games[gid];
								console.log(`Destroyed room ${gid}`);
							}
							socket.send("Left game #" + gid);
							return;
						case "MOVE_UP":
							
							socket.send("Moved up!");
							return;
						case "MOVE_DOWN":
							
							socket.send("Moved down!");
							return;
						case "STOP":
							
							socket.send("Stopped!");
							return;
						case "MESSAGE":
							if (!param) {
								socket.send(JSON.stringify({ error: "Invalid message action: no param variable with message" }));
								return;
							}
							socket.send("You said: " + param);
							return;
						default:
							socket.send(JSON.stringify({ error: "Invalid action. Available actions: JOIN/LEAVE/MOVE_UP/MOVE_DOWN/STOP/MESSAGE" }));
							return;
					}
				} catch (err) {
					socket.send(JSON.stringify({ error: err.message }));
					return ;
				}
			});

			socket.on('close', () => {
				if (member.game) {
					const id = member.game.uuid;
					member.leave();
					if (games[id].player_count() == 0) {
						delete games[id];
						console.log(`Destroyed room ${id}`);
					}
				}
				return;
			});
	});
	done();
};

export default pongHandler;