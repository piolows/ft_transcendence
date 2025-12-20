// handle get request for online/offline status (of someone)
// handle post request for online/offline status (of ourself)
const endpointHandler = (fastify, options, done) => {
	const UT = process.env.USERS_TABLE;
	const ST = process.env.STATS_TABLE;
	const FT = process.env.FRIENDS_TABLE;
	const HT = process.env.HISTORY_TABLE;
	const FRIENDS_PER_PAGE = 8;
	const GAMES_PER_PAGE = 10;
	const PLAYERS_PER_PAGE = 10;
	const THRESHOLD_MS = 6 * 1000;
	
	function sqliteNow() {
		return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
	}

	function isDictionary(obj) {
		return obj != null && typeof obj == 'object' && !Array.isArray(obj);
	}

	async function addGame(user_id, op_id, info, date) {
		if ("local_op" in info) {
			await fastify.sqlite.prepare(`INSERT INTO ${HT} (user_id, op_id, winner_id, local_op, game, p1_score, p2_score, time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
				.run(user_id, op_id, info.winner_id, info.local_op, info.game, info.p1_score, info.p2_score, info.time, date);
			return ;
		}
		await fastify.sqlite.prepare(`INSERT INTO ${HT} (user_id, op_id, winner_id, game, p1_score, p2_score, time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
			.run(user_id, op_id, info.winner_id, info.game, info.p1_score, info.p2_score, info.time, date);
		const stats = await fastify.sqlite.prepare(`SELECT * FROM ${ST} WHERE user_id=?`).get(user_id);
		if (user_id == info.winner_id) {
			stats.wins += 1;
			stats.points += 50;
		}
		else if (info.winner_id == op_id) {
			stats.losses += 1;
			stats.points -= 30;
		}
		else {
			stats.draws += 1;
		}
		stats.win_rate = stats.wins / (stats.wins + stats.losses);
		await fastify.sqlite.prepare(`UPDATE ${ST} SET wins=?, losses=?, draws=?, win_rate=?, points=? WHERE user_id=?`)
			.run(stats.wins, stats.losses, stats.draws, stats.win_rate, stats.points, user_id);
	}

	fastify.post("/", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, source: "/users", error: `Invalid Request: JSON Body required` });
		const required = ["id", "username", "email", "avatarURL"];
		for (const key of required) {
			if (!(key in req.body)) {
				return resp.send({ success: false, code: 400, source: "/users", error: `Missing field: ${key}` });
			}
		}
		try {
			let record = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE email=?`).get(req.body.email);
			if (!record) {
				await fastify.sqlite.prepare(`INSERT INTO ${UT} (id, username, email, avatarURL) VALUES (?, ?, ?, ?)`)
					.run(req.body.id, req.body.username, req.body.email, req.body.avatarURL);
			} else {
				await fastify.sqlite.prepare(`UPDATE ${UT} SET id=?,username=?,email=?,avatarURL=? WHERE email=?`)
				.run(req.body.id, req.body.username, req.body.email, req.body.avatarURL, req.body.email);
			}
			record = await fastify.sqlite.prepare(`SELECT * FROM ${ST} WHERE user_id=?`).get(req.body.id);
			if (!record) {
				await fastify.sqlite.prepare(`INSERT INTO ${ST} (user_id) VALUES (?)`)
					.run(req.body.id);
			}
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users", error: error.message });
		}
	});

	fastify.delete("/", async (req, reply) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, source: "/users/delete", error: `Invalid Request: JSON Body required` });
		if (!req.body.username)
			return resp.send({ success: false, code: 400, source: "/users/delete", error: "Must provide username" });
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.send({ success: false, code: 404, source: "/users/delete", error: 'User does not exists!' });
			}
			if (!await argon2.verify(user['password'], req.body.password)) {
				return reply.send({ success: false, code: 403, source: "/users/delete", error: "Wrong password" });
			}
			await fastify.sqlite.prepare(`DELETE FROM ${UT} WHERE username=?`).run(req.body.username);
			return reply.send({ success: true });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/users/delete", error: error.message });
		}
	});

	fastify.get("/:username", async (req, resp) => {
		if (!req.params.username || req.params.username == "")
			return resp.send({ success: false, code: 400, source: "/users/:username", error: "Must provide username" });
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username", error: "User not found" });
			}
			const friend_cnt = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(user['id'])['COUNT(user_id)'];
			let is_friend = undefined;
			if (req.query.id && req.query.id != user['id']) {
				const exist = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(user['id'], req.query.id);
				is_friend = false;
				if (exist)
					is_friend = true;
			}
			const stats = await fastify.sqlite.prepare(`SELECT * FROM ${ST} WHERE user_id=?`).get(user['id']);
			const game_cnt = stats.wins + stats.losses;
			const games = await fastify.sqlite.prepare(`SELECT
				${UT}.username, ${UT}.email, ${UT}.avatarURL, ${HT}.winner_id, ${HT}.game, ${HT}.p1_score, ${HT}.p2_score, ${HT}.time, ${HT}.created_at
				FROM ${HT} JOIN ${UT} ON ${HT}.op_id = ${UT}.id WHERE ${HT}.user_id=? AND ${HT}.created_at > datetime('now', '-24 hour')
				ORDER BY ${HT}.created_at DESC LIMIT 3 OFFSET 0`).all(user['id']);
			let online = false;
			const last_seen = user.last_seen;

			if (last_seen) {
				const last = new Date(last_seen.replace(' ', 'T') + 'Z');
				const now = new Date();
				const diffMs = now - last;
				online = (diffMs < THRESHOLD_MS);
			}
			return resp.send({ success: true, user, friend_cnt, stats, game_cnt, games, is_friend, online, last_seen });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/:username", error: error.message });
		}
	});

	fastify.get("/:username/history", async (req, resp) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/history:get", error: "User not found" });
			}
			if (!("page" in req.query) || req.query.page < 1) {
				req.query.page = 1;
			}
			const OFFSET = (req.query.page - 1) * GAMES_PER_PAGE;
			const games = await fastify.sqlite.prepare(`SELECT
				${UT}.username, ${UT}.email, ${UT}.avatarURL, ${HT}.winner_id, ${HT}.game, ${HT}.p1_score, ${HT}.p2_score, ${HT}.time, ${HT}.created_at
				FROM ${HT} JOIN ${UT} ON ${HT}.op_id = ${UT}.id WHERE ${HT}.user_id=? ORDER BY ${HT}.created_at DESC LIMIT ? OFFSET ?`).all(user['id'], GAMES_PER_PAGE, OFFSET);
			const count = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${HT} WHERE user_id=?`).get(user['id'])['COUNT(user_id)'];
			return resp.send({ success: true, games: games, user, count });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/:username/history:get", error: error.message });
		}
	});

	fastify.post("/:username/history", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, source: "/users/:username/history:post", error: `Invalid Request: JSON Body required` });
		const required = ["op_id", "winner_id", "p1_score", "p2_score", "game", "time"];
		for (const key of required) {
			if (!(key in req.body)) {
				return resp.send({ success: false, code: 400, source: "/users/:username/history:post", error: `Missing field: ${key}` });
			}
		}
		try {
			if (req.body.op_id >= 0) {
				const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.op_id);
				if (!user) {
					return resp.send({ success: false, code: 404, source: "/users/:username/history:post", error: "Opponent not found" });
				}
			}
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/history:post", error: "User not found" });
			}
			if (user['id'] == req.body.op_id) {
				if (!("local_op" in req.body))
					req.body["local_op"] = "Player 2";
			}
			if ((req.body.winner_id == req.body.op_id && req.body.p1_score > req.body.p2_score)
				|| (req.body.winner_id == user['id'] && req.body.p1_score < req.body.p2_score)) {
				let tmp = req.body.p1_score;
				req.body.p1_score = req.body.p2_score;
				req.body.p2_score = tmp;
			}
			const date = sqliteNow();
			addGame(user['id'], req.body.op_id, req.body, date);
			let tmp = req.body.p1_score;
			req.body.p1_score = req.body.p2_score;
			req.body.p2_score = tmp;
			addGame(req.body.op_id, user['id'], req.body, date);
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/:username/history:post", error: error.message });
		}
	});

	// AGG [WIP]
	// Description: Send post request for last seen online. Check if user exists using id from frontend. Get time now, update.
	fastify.post("/status", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, source: "/users/status", error: `Invalid Request: JSON Body required` });
		if (!req.body.id)
			return resp.send({ success: false, code: 400, source: "/users/status", error: `Missing field: id`});
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.id);
			if (!user)
				return resp.send({ success: false, code: 404, source: "/users/status", error: "User not found" });

			const now = sqliteNow();
			await fastify.sqlite.prepare(`UPDATE ${UT} SET last_seen=? WHERE id=?`).run(now, req.body.id);

			return resp.send({ success: true, last_seen: now });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/status", error: error.message });
		}
	});

	// Get the latest last seen time from the database for the given username. Calculate if the user is online based on the last seen time.
	fastify.get("/status/:username", async (req, resp) => {
		const username = req.params.username;
		if (!username || username == "")
			return resp.send({ success: false, code: 400, source: "/users/status/:username", error: "Must provide username" });
		try {
			const user = await fastify.sqlite.prepare(`SELECT id, username, last_seen FROM ${UT} WHERE username=?`).get(username);
			if (!user)
				return resp.send({ success: false, code: 404, source: "/users/status/:username", error: "User not found" });

			let online = false;
			let last_seen = user.last_seen;

			if (last_seen) {
				const last = new Date(last_seen.replace(' ', 'T') + 'Z');
				const now = new Date();
				const diffMs = now - last;
				online = (diffMs < THRESHOLD_MS);
			}
			return resp.send({ success: true, online, last_seen });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/status/:username", error: error.message });
		}
	});
	// AGG [WIP]

	fastify.get("/top", async (req, resp) => {
		try {
			if (!("page" in req.query)) {
				const top_players = await fastify.sqlite.prepare(`SELECT ${UT}.username, ${ST}.points FROM ${ST}
					JOIN ${UT} ON ${ST}.user_id = ${UT}.id ORDER BY ${ST}.points DESC LIMIT 3 OFFSET 0`).all();
				return resp.send({ success: true, top_players });
			}
			const player_count = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${ST}`).get()['COUNT(user_id)'];
			if (req.query.page < 1)
				req.query.page = 1;
			const OFFSET = (req.query.page - 1) * PLAYERS_PER_PAGE;
			const top_players = await fastify.sqlite.prepare(`SELECT ${UT}.username, ${ST}.points FROM ${ST}
					JOIN ${UT} ON ${ST}.user_id = ${UT}.id ORDER BY ${ST}.points DESC LIMIT ? OFFSET ?`).all(PLAYERS_PER_PAGE, OFFSET);
			return resp.send({ success: true, top_players, player_count });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/top", error: error.message });
		}
	});

	// fastify.get("/:username/stats", async (req, resp) => {
	// 	try {
	// 		const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
	// 		if (!user) {
	// 			return resp.send({ success: false, code: 404, source: "/users/:username/stats", error: "User not found" });
	// 		}
	// 		const stats = await fastify.sqlite.prepare(`SELECT * FROM ${ST} WHERE user_id=?`).get(user['id']);
	// 		return resp.send({ success: true, stats: stats });
	// 	} catch (error) {
	// 		return resp.send({ success: false, code: 500, source: "/users/:username/stats", error: error.message });
	// 	}
	// });

	fastify.get("/:username/friends", async (req, resp) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/friends:get", error: "User not found" });
			}
			if (!("page" in req.query) || req.query.page < 1) {
				req.query.page = 1;
			}
			const OFFSET = (req.query.page - 1) * FRIENDS_PER_PAGE;
			if (!("uid" in req.query)) {
				const friends = await fastify.sqlite.prepare(`SELECT ${UT}.username, ${UT}.avatarURL FROM ${FT}
					JOIN ${UT} ON ${FT}.friend_id = ${UT}.id WHERE ${FT}.user_id=? ORDER BY ${UT}.username ASC LIMIT ? OFFSET ?`).all(user['id'], FRIENDS_PER_PAGE, OFFSET);
				const count = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(user['id']);
				return resp.send({ success: true, friends: friends, user, count });
			}
			else {
				const query = `SELECT u.id, u.username, u.avatarURL, pts.points, pts.win_rate,
					CASE WHEN f2.friend_id IS NOT NULL THEN 1 ELSE 0 END AS is_friend
					FROM ${FT} f1
					JOIN ${UT} u ON u.id = f1.friend_id
					LEFT JOIN ${ST} pts
					ON f1.friend_id = pts.user_id
					LEFT JOIN ${FT} f2
					ON f1.friend_id = f2.friend_id
					AND f2.user_id = ?
					WHERE f1.user_id = ? ORDER BY u.username ASC LIMIT ? OFFSET ?;`;
				const friends = await fastify.sqlite.prepare(query).all(req.query.uid, user['id'], FRIENDS_PER_PAGE, OFFSET);
				const count = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(user['id'])['COUNT(user_id)'];
				return resp.send({ success: true, friends: friends, user, count });
			}
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/:username/friends:get", error: error.message });
		}
	});

	fastify.post("/:username/friends", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, source: "/users/:username/friends:post", error: `Invalid Request: JSON Body required` });
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, source: "/users/:username/friends:post", error: `Missing Field: user_id` });
		try {
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.user_id);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/friends:post", error: "User with user_id not found" });
			}
			user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/friends:post", error: "Target user not found" });
			}
			const rec1 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(user['id'], req.body.user_id);
			const rec2 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(req.body.user_id, user['id']);
			if (rec1 && rec2) {
				return resp.send({ success: false, code: 403, source: "/users/:username/friends:post", error: "Already friends" });
			}
			if (!rec1)
				await fastify.sqlite.prepare(`INSERT INTO ${FT} (user_id, friend_id) VALUES (?, ?)`).run(user['id'], req.body.user_id);
			if (!rec2)
				await fastify.sqlite.prepare(`INSERT INTO ${FT} (user_id, friend_id) VALUES (?, ?)`).run(req.body.user_id, user['id']);
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/:username/friends:post", error: error.message });
		}
	});

	fastify.delete("/:username/friends", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, source: "/users/:username/friends:delete", error: `Invalid Request: JSON Body required` });
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, source: "/users/:username/friends:delete", error: `Missing Field: user_id` });
		try {
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.user_id);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/friends:delete", error: "User with user_id not found" });
			}
			user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, source: "/users/:username/friends:delete", error: "Target user not found" });
			}
			const rec1 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(user['id'], req.body.user_id);
			const rec2 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(req.body.user_id, user['id']);
			if (!rec1 && !rec2) {
				return resp.send({ success: false, code: 403, source: "/users/:username/friends:delete", error: "Already not friends" });
			}
			if (rec1)
				await fastify.sqlite.prepare(`DELETE FROM ${FT} WHERE user_id=? AND friend_id=?`).run(user['id'], req.body.user_id);
			if (rec2)
				await fastify.sqlite.prepare(`DELETE FROM ${FT} WHERE user_id=? AND friend_id=?`).run(req.body.user_id, user['id']);
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, source: "/users/:username/friends:delete", error: error.message });
		}
	});

	done();
};

export default endpointHandler;
