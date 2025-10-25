const endpointHandler = (fastify, options, done) => {
	const UT = process.env.USERS_TABLE;
	const ST = process.env.STATS_TABLE;
	const FT = process.env.FRIENDS_TABLE;
	const HT = process.env.HISTORY_TABLE;
	const FRIENDS_PER_PAGE = 10;
	const GAMES_PER_PAGE = 10;

	fastify.post("/", async (req, resp) => {
		if (!req.body.id || !req.body.username || !req.body.email || !req.body.avatarURL || !req.body.email)
			return resp.send({ success: false, code: 400, error: "Must include all information" });
		try {
			await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET id=?,username=?,email=?,avatarURL=? WHERE email=?`)
				.run(req.body.id, req.body.username, req.body.email, req.body.avatarURL, req.body.email);
			return resp.reply({ success: true });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/all", (req, resp) => {
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, error: "Must provide user_id" });
		try {
			const count = fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(req.body.user_id);
			const stats = fastify.sqlite.prepare(`SELECT wins, losses, win_rate FROM ${ST} WHERE user_id=?`).get(req.body.user_id);
			const games = fastify.sqlite.prepare(`SELECT
				${UT}.username, ${UT}.email, ${UT}.avatarURL, ${HT}.game, ${HT}.p1_score, ${HT}.p2_score, ${HT}.time, ${HT}.created_at
				FROM ${HT} JOIN ${UT} ON ${HT}.winner_id = ${UT}.id WHERE ${HT}.user_id=? ORDER BY ${HT}.created_at DESC LIMIT 3 OFFSET 0`).all(req.body.user_id);
			return resp.send({ success: true, friend_cnt: count, stats: stats, games: games });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/history", (req, resp) => {
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, error: "Must provide user_id" });
		if (!req.body.page) {
			const count = fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${HT} WHERE user_id=?`).get(req.body.user_id);
			return resp.send({ success: true, count: count });
		}
		const OFFSET = (req.body.page - 1) * GAMES_PER_PAGE;
		try {
			const games = fastify.sqlite.prepare(`SELECT
				${UT}.username, ${UT}.email, ${UT}.avatarURL, ${HT}.game, ${HT}.p1_score, ${HT}.p2_score, ${HT}.time, ${HT}.created_at
				FROM ${HT} JOIN ${UT} ON ${HT}.winner_id = ${UT}.id WHERE ${HT}.user_id=? ORDER BY ${HT}.created_at DESC LIMIT ? OFFSET ?`).all(req.body.user_id, GAMES_PER_PAGE, OFFSET);
			return resp.send({ success: true, games: games });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/stats", (req, resp) => {
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, error: "Must provide user_id" });
		try {
			const stats = fastify.sqlite.prepare(`SELECT wins, losses, win_rate FROM ${ST} WHERE user_id=?`).get(req.body.user_id);
			return resp.send({ success: true, stats: stats });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.get("/friends", (req, resp) => {
		if (!req.body.user_id)
			return resp.send({ success: false, code: 400, error: "Must provide user_id" });
		if (!req.body.page) {
			const count = fastify.sqlite.prepare(`SELECT COUNT(user_id) FROM ${FT} WHERE user_id=?`).get(req.body.user_id);
			return resp.send({ success: true, count: count });
		}
		const OFFSET = (req.body.page - 1) * FRIENDS_PER_PAGE;
		try {
			const friends = fastify.sqlite.prepare(`SELECT ${UT}.username, ${UT}.email, ${UT}.avatarURL FROM ${FT}
				JOIN ${UT} ON ${FT}.friend_id = ${UT}.id WHERE ${FT}.user_id=? ORDER BY ${UT}.username ASC LIMIT ? OFFSET ?`).all(req.body.user_id, FRIENDS_PER_PAGE, OFFSET);
			return resp.send({ success: true, friends: friends });
		} catch (error) {
			return resp.send({ success: false, code: 500, error: error.message });
		}
	});

	done();
};

export default endpointHandler;