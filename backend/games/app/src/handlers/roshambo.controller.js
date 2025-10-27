const roshamboHandler = (fastify, options, done) => {
	

	done();
};

export default roshamboHandler;

const pongHandler = (fastify, options, done) => {
	let conns = {};
	let players = [];

	fastify.get("/", { websocket: true }, (connection, req) => {
		const id = crypto.randomUUID();

		conns[id] = connection.socket;
		console.log(`Client connected: ${id} (Total: ${conns.keys().length})`);

		// Handle incoming messages
		connection.socket.on('message', (msg) => {
			const text = msg.toString();
			console.log(`Message from ${id}:`, text);

			// Echo back to the sender
			connection.socket.send(`You said: ${text}`);

			// (Optional) Broadcast to others:
			// for (const [otherId, sock] of clients.entries()) {
			//   if (otherId !== id) sock.send(`User ${id} says: ${text}`);
			// }
			// const data = JSON.parse(msg.toString());
			// if (data.moving) {
			// 	p_info
			// }
			// else {
			// 	p_info
			// }
		});

		// Handle disconnection
		connection.socket.on('close', () => {
			conns.delete(id);
			console.log(`Client disconnected: ${id} (Total: ${clients.size})`);
			// players = players.filter((p) => p !== connection);
			// p_info = p_info.filter((p) => p.conn !== connection);
		});
	
		players.push(connection);
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