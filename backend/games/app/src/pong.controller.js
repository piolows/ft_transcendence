const pongHandler = (fastify, options, done) => {
	let conns = {};

	fastify.get("/", { websocket: true }, (connection, req) => {
		const id = crypto.randomUUID();
		conns[id] = connection;

		console.log(`Client connected: ${id} (Total: ${Object.keys(conns).length})`);

		connection.on('message', (msg) => {
			const text = msg.toString();
			console.log(`Message from ${id}:`, text);
			connection.send(`You said: ${text}`);
		});

		connection.on('close', () => {
			delete conns[id];
			console.log(`Client disconnected: ${id} (Total: ${Object.keys(conns).length})`);
		});
	});
	done();
};

export default pongHandler;