export const leaderboardTop = (fastify, options, done) => {
	const PLAYERS_PER_PAGE = 10;

	fastify.get("/top", async (req, resp) => {
		try {
			if (!("page" in req.query) || req.query.page < 1) {
				const games = await fastify.sqlite.prepare(`SELECT ${UT}.username ${ST}.points FROM ${HT}
					JOIN ${UT} ON ${ST}.user_id = ${UT}.id ORDER BY ${ST}.points DESC LIMIT 3 OFFSET 0`).all();
				return resp.send({ success: true, games });
			}
			const OFFSET = (req.query.page - 1) * PLAYERS_PER_PAGE;
			const games = await fastify.sqlite.prepare(`SELECT ${UT}.username ${ST}.points FROM ${HT}
					JOIN ${UT} ON ${ST}.user_id = ${UT}.id ORDER BY ${ST}.points DESC LIMIT ? OFFSET ?`).all(PLAYERS_PER_PAGE, OFFSET);
			return resp.send({ success: true, user, friend_cnt, stats, game_cnt, games, is_friend });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});
}

const endpointHandler = (fastify, options, done) => {
	const UT = process.env.USERS_TABLE;
	const ST = process.env.STATS_TABLE;
	const FT = process.env.FRIENDS_TABLE;
	const HT = process.env.HISTORY_TABLE;
	const FRIENDS_PER_PAGE = 10;
	const GAMES_PER_PAGE = 10;

	function isDictionary(obj) {
		return obj != null && typeof obj == 'object' && !Array.isArray(obj);
	}

	fastify.post("/", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, error: `Invalid Request: JSON Body required` });
		const required = ["id", "username", "email", "avatarURL"];
		for (const key of required) {
			if (!(key in req.body)) {
				return resp.send({ success: false, code: 400, error: `Missing field: ${key}` });
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
				await fastify.sqlite.prepare(`INSERT INTO ${ST} (user_id, wins, losses, win_rate) VALUES (?, ?, ?, ?)`)
					.run(req.body.id, 0, 0, 0);
			}
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.delete("/", async (req, reply) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, error: `Invalid Request: JSON Body required` });
		if (!req.body.username)
			return resp.send({ success: false, code: 400, error: "Must provide username" });
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.send({ success: false, code: 404, error: 'User does not exists!' });
			}
			if (!await argon2.verify(user['password'], req.body.password)) {
				return reply.send({ success: false, code: 403, error: "Wrong password" });
			}
			await fastify.sqlite.prepare(`DELETE FROM ${UT} WHERE username=?`).run(req.body.username);
			return reply.send({ success: true });
		} catch (error) {
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/:username", async (req, resp) => {
		if (!req.params.username || req.params.username == "")
			return resp.send({ success: false, code: 400, error: "Must provide username" });
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User not found" });
			}
			const friend_cnt = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(user['id'])['COUNT(user_id)'];
			let is_friend = undefined;
			if (req.query.id && req.query.id != user['id']) {
				const exist = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(user['id'], req.query.id);
				is_friend = false;
				if (exist)
					is_friend = true;
			}
			let stats = await fastify.sqlite.prepare(`SELECT wins, losses, win_rate FROM ${ST} WHERE user_id=?`).get(user['id']);
			if (!stats) {
				stats = {
					wins: 0,
					losses: 0,
					win_rate: 0
				}
			}
			const game_cnt = stats.wins + stats.losses;
			const games = await fastify.sqlite.prepare(`SELECT
				${UT}.username, ${UT}.email, ${UT}.avatarURL, ${HT}.winner_id, ${HT}.game, ${HT}.p1_score, ${HT}.p2_score, ${HT}.time, ${HT}.created_at
				FROM ${HT} JOIN ${UT} ON ${HT}.op_id = ${UT}.id WHERE ${HT}.user_id=? AND ${HT}.created_at > datetime('now', '-24 hour')
				ORDER BY ${HT}.created_at DESC LIMIT 3 OFFSET 0`).all(user['id']);
			return resp.send({ success: true, user, friend_cnt, stats, game_cnt, games, is_friend });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/:username/history", async (req, resp) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User not found" });
			}
			if (!("page" in req.query) || req.query.page < 1) {
				const count = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${HT} WHERE user_id=?`).get(user['id']);
				return resp.send({ success: true, count: count });
			}
			const OFFSET = (req.query.page - 1) * GAMES_PER_PAGE;
			const games = await fastify.sqlite.prepare(`SELECT
				${UT}.username, ${UT}.email, ${UT}.avatarURL, ${HT}.winner_id, ${HT}.game, ${HT}.p1_score, ${HT}.p2_score, ${HT}.time, ${HT}.created_at
				FROM ${HT} JOIN ${UT} ON ${HT}.op_id = ${UT}.id WHERE ${HT}.user_id=? ORDER BY ${HT}.created_at DESC LIMIT ? OFFSET ?`).all(user['id'], GAMES_PER_PAGE, OFFSET);
			return resp.send({ success: true, games: games, user });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.post("/:username/history", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, error: `Invalid Request: JSON Body required` });
		const required = ["op_id", "winner_id", "p1_score", "p2_score", "game", "time"];
		for (const key of required) {
			if (!(key in req.body)) {
				return resp.send({ success: false, code: 400, error: `Missing field: ${key}` });
			}
		}
		try {
			if (req.body.op_id > 0) {
				const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.op_id);
				if (!user) {
					return resp.send({ success: false, code: 404, error: "Opponent not found" });
				}
			}
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User not found" });
			}
			await fastify.sqlite.prepare(`INSERT INTO ${HT} (user_id, op_id, winner_id, game, p1_score, p2_score, time) VALUES (?, ?, ?, ?, ?, ?, ?)`)
				.run(user['id'], req.body.op_id, req.body.winner_id, req.body.game, req.body.p1_score, req.body.p2_score, req.body.time);
			const stats = await fastify.sqlite.prepare(`SELECT wins, losses, win_rate FROM ${ST} WHERE user_id=?`).get(user['id']);
			if (user['id'] == req.body.winner_id)
				stats.wins += 1;
			else
				stats.losses += 1;
			stats.win_rate = stats.wins / (stats.wins + stats.losses);
			await fastify.sqlite.prepare(`UPDATE ${ST} SET wins=?, losses=?, win_rate=? WHERE user_id=?`)
				.run(stats.wins, stats.losses, stats.win_rate, user['id']);
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/:username/stats", async (req, resp) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User not found" });
			}
			const stats = await fastify.sqlite.prepare(`SELECT wins, losses, win_rate FROM ${ST} WHERE user_id=?`).get(user['id']);
			return resp.send({ success: true, stats: stats });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/:username/friends", async (req, resp) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User not found" });
			}
			if (!("page" in req.query) || req.query.page < 1) {
				const count = await fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(user['id']);
				return resp.send({ success: true, count: count });
			}
			const OFFSET = (req.query.page - 1) * FRIENDS_PER_PAGE;
			if (!("uid" in req.query)) {
				const friends = await fastify.sqlite.prepare(`SELECT ${UT}.username, ${UT}.avatarURL FROM ${FT}
					JOIN ${UT} ON ${FT}.friend_id = ${UT}.id WHERE ${FT}.user_id=? ORDER BY ${UT}.username ASC LIMIT ? OFFSET ?`).all(user['id'], FRIENDS_PER_PAGE, OFFSET);
				return resp.send({ success: true, friends: friends, user });
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
				return resp.send({ success: true, friends: friends, user });
			}
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.post("/:username/friends", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, error: `Invalid Request: JSON Body required` });
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, error: `Missing Field: user_id` });
		try {
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.user_id);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User with user_id not found" });
			}
			user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "Target user not found" });
			}
			const rec1 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(user['id'], req.body.user_id);
			const rec2 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(req.body.user_id, user['id']);
			if (rec1 && rec2) {
				return resp.send({ success: false, code: 403, error: "Already friends" });
			}
			if (!rec1)
				await fastify.sqlite.prepare(`INSERT INTO ${FT} (user_id, friend_id) VALUES (?, ?)`).run(user['id'], req.body.user_id);
			if (!rec2)
				await fastify.sqlite.prepare(`INSERT INTO ${FT} (user_id, friend_id) VALUES (?, ?)`).run(req.body.user_id, user['id']);
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.delete("/:username/friends", async (req, resp) => {
		if (!req.body || !isDictionary(req.body))
			return resp.send({ success: false, code: 400, error: `Invalid Request: JSON Body required` });
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, error: `Missing Field: user_id` });
		try {
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE id=?`).get(req.body.user_id);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "User with user_id not found" });
			}
			user = await fastify.sqlite.prepare(`SELECT * FROM ${UT} WHERE username=?`).get(req.params.username);
			if (!user) {
				return resp.send({ success: false, code: 404, error: "Target user not found" });
			}
			const rec1 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(user['id'], req.body.user_id);
			const rec2 = await fastify.sqlite.prepare(`SELECT * FROM ${FT} WHERE user_id=? AND friend_id=?`).get(req.body.user_id, user['id']);
			if (!rec1 && !rec2) {
				return resp.send({ success: false, code: 403, error: "Already not friends" });
			}
			if (rec1)
				await fastify.sqlite.prepare(`DELETE FROM ${FT} WHERE user_id=? AND friend_id=?`).run(user['id'], req.body.user_id);
			if (rec2)
				await fastify.sqlite.prepare(`DELETE FROM ${FT} WHERE user_id=? AND friend_id=?`).run(req.body.user_id, user['id']);
			return resp.send({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	done();
};

export default endpointHandler;