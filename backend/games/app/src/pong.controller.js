const pongHandler = (fastify, options, done) => {
	class Member {
		id;
		user_info;
		socket;
		game = null;
		is_player = false;

		constructor(socket, user_info) {
			this.id = crypto.randomUUID();
			this.socket = socket;
			this.user_info = user_info;
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

	class Game {
		id;
		admin;
		players = {};
		specs = {};
		all = {};
		done = false;
		p1_score = 0;
		p2_score = 0;

		constructor(admin) {
			this.id = crypto.randomUUID();
			this.admin = admin;
			this.specs[admin.id] = admin;
			this.all[admin.id] = admin;
		}

		player_count() {
			return Object.keys(this.players).length;
		}

		spec_count() {
			return Object.keys(this.specs).length;
		}

		join(member) {
			if (this.players[member.id] || this.specs[member.id])
				throw new Error("User already in game");
			if (Object.keys(this.players).length == 2)
				this.spec_join(member);
			else
				this.player_join(member);
		}

		player_join(player) {
			if (player.id == this.admin.id) {
				throw new Error("WTF jaksdfljalksdfjlaskjlfdsa");
			}
			if (this.players[player.id])
				throw new Error("Player already in game");
			if (Object.keys(this.players).length == 2)
				throw new Error("Max players in current game");
			player.is_player = true;
			player.game = this;
			this.players[player.id] = player;
			delete this.specs[player.id];
			this.all[player.id] = player;
		}

		player_leave(player) {
			if (!this.players[player.id])
				throw new Error("Player not in this game");
			this.players[player.id].game = null;
			this.players[player.id].is_player = false;
			delete this.players[player.id];
			delete this.all[player.id];
		}

		spec_join(spec) {
			spec.is_player = false;
			this.specs[spec.id] = spec;
			this.all[spec.id] = spec;
		}

		spec_leave(spec) {
			if (!this.specs[spec.id])
				throw new Error("User not in this game");
			delete this.specs[spec.id];
			delete this.all[spec.id];
		}
	}

	let games = {};

	fastify.post("/new", (req, resp) => {
		if (Object.keys(games).length > 256) {
			return resp.code(501).send({ status: "failed", error: "Maximum game limit reached" });
		}
		if (!req.session || !req.session.user) {
			return resp.code(403).send({ error: "Must be signed in to create a game" });
		}
		const game = new Game(req.session.user);
		games[game.id] = game;
		return resp.code(200).send({ status: "success", game_id: game.id})
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

			console.log(`New player connected: ${member.id}`);

			socket.on('message', (msg) => {
				let data;
				try {
					data = JSON.parse(msg);
				} catch (err) {
					socket.send(JSON.stringify({ error: "Invalid JSON" }));
					return;
				}

				const { game_id, action, param } = data;

				const getinfo = (guy) => {return `${guy.id} - ${guy.email} - ${guy.username}`;}
				const getinfos = (guys) => {let ret = ""; for (const guy of guys) ret += getinfo(guy) + "  "; return ret;}
				if (action == "INFO") {
					for (const game of Object.values(games)) {
						socket.send(`Game of ID #${game.id} has admin ${getinfo(game.admin)} with ${getinfos(Object.values(game.specs))} spectators and ${getinfos(Object.values(game.players))} players.`);
					};
					return;
				}

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
						case "PLAY":
							member.play(games[game_id]);
							socket.send("Joined game #" + game_id);
							return;
						case "SPEC":
							member.spec(games[game_id]);
							socket.send("Joined game #" + game_id);
							return;
						case "JOIN":
							member.join(games[game_id]);
							socket.send("Joined game #" + game_id);
							return;
						case "LEAVE":
							const tmp_game = member.game;
							member.leave();
							if (tmp_game.player_count() == 0) {
								delete games[tmp_game.id];
							}
							socket.send("Left game #" + game_id);
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
							socket.send(JSON.stringify({ error: "Invalid action. Available actions: PLAY/SPEC/JOIN/LEAVE/MOVE_UP/MOVE_DOWN/STOP/MESSAGE" }));
							return;
					}
				} catch (err) {
					socket.send(JSON.stringify({ error: err.message }));
					return ;
				}
			});

			socket.on('close', () => {
				if (member.game) {
					const id = member.game.id;
					member.leave();
					if (games[id].player_count() == 0) {
						delete games[id];
					}
				}
				return;
			});
	});
	done();
};

export default pongHandler;