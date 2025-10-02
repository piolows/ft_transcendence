const pongHandler = (fastify, options, done) => {
	let players = [];
	let p_info = [];

	fastify.get("/pong", { websocket: true }, (connection, req) => {
		players.push(connection);

		connection.socket.on("message", (msg) => {
			const data = JSON.parse(msg.toString());
			if (data.moving) {
				p_info
			}
			else {
				p_info
			}
		});

		connection.socket.on("close", () => {
			players = players.filter((p) => p !== connection);
			p_info = p_info.filter((p) => p.conn !== connection);
		});
	});

	// Game loop: runs 60 times/sec
	setInterval(() => {
		// update ball + paddles
		const gameState = { /* positions, scores, etc */ };
		for (const player of players) {
			player.socket.send(JSON.stringify({ type: "state", gameState }));
		}
	}, 1000 / 60);

	done();
};

export default pongHandler;