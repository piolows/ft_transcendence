const endpointHandler = (fastify, options, done) => {
	fastify.all("/auth/*", async (req, reply) => {
		try {
			const subPath = req.params["*"] ?? "";
			const queryString = req.raw.url.includes("?") ? "?" + req.raw.url.split("?")[1] : "";
			const serviceURI = process.env.AUTH_URI + (process.env.AUTH_URI.endsWith("/") ? "" : "/");
			const URL = `${serviceURI}${subPath}${queryString}`;
			const response = await fetch(URL, {
				method: req.method,
				headers: req.headers,
				body: (req.method == "GET" || req.method == "HEAD") ? undefined : req.raw
			});
			// Set response status & headers before streaming
			reply.status(response.status);
			for (const [key, value] of response.headers.entries()) {
				reply.header(key, value);
			}

			// Stream response body directly (doesn't assume JSON)
			return reply.send(response.body);
		} catch (error) {
			return reply.code(500).send(error);
		}
	});

	fastify.all("/users/*", async (req, reply) => {
		try {
			const subPath = req.params["*"] ?? "";
			const queryString = req.raw.url.includes("?") ? "?" + req.raw.url.split("?")[1] : "";
			const serviceURI = process.env.USER_URI + (process.env.USER_URI.endsWith("/") ? "" : "/");
			const URL = `${serviceURI}${subPath}${queryString}`;
			const response = await fetch(URL, {
				method: req.method,
				headers: req.headers,
				body: (req.method == "GET" || req.method == "HEAD") ? undefined : req.raw
			});
			// Set response status & headers before streaming
			reply.status(response.status);
			for (const [key, value] of response.headers.entries()) {
				reply.header(key, value);
			}

			// Stream response body directly (doesn't assume JSON)
			return reply.send(response.body);
		} catch (error) {
			return reply.code(500).send(error);
		}
	});

	done();
};

export default endpointHandler;