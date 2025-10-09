const endpointHandler = (fastify, options, done) => {
	fastify.all("/auth/*", async (req, reply) => {
		try {
			const subPath = req.params["*"] ?? "";
			const queryString = req.raw.url.includes("?") ? "?" + req.raw.url.split("?")[1] : "";
			const serviceURI = process.env.AUTH_URL + (process.env.AUTH_URL.endsWith("/") ? "" : "/");
			const URL = `${serviceURI}${subPath}${queryString}`;

			let body = undefined;
			let response = undefined;
			if (req.method != "GET" && req.method != "HEAD") {
				const contentType = req.headers["content-type"] ?? "";
				if (contentType.includes("application/json")) {
					body = JSON.stringify(req.body);
				} else if (contentType.includes("application/x-www-form-urlencoded")) {
					body = new URLSearchParams(req.body).toString();
				} else {
					body = req.body;
				}
				response = await fetch(URL, {
					method: req.method,
					headers: {
						...req.headers,
						"content-length": body ? Buffer.byteLength(body).toString() : undefined
					},
					body: body
				});
			}
			else {
				response = await fetch(URL, {
					method: req.method,
					headers: req.headers
				});
			}
			
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
			const serviceURI = process.env.USER_URL + (process.env.USER_URL.endsWith("/") ? "" : "/");
			const URL = `${serviceURI}${subPath}${queryString}`;

			let body = undefined;
			let response = undefined;
			if (req.method != "GET" && req.method != "HEAD") {
				const contentType = req.headers["content-type"] ?? "";
				if (contentType.includes("application/json")) {
					body = JSON.stringify(req.body);
				} else if (contentType.includes("application/x-www-form-urlencoded")) {
					body = new URLSearchParams(req.body).toString();
				} else {
					body = req.body;
				}
				response = await fetch(URL, {
					method: req.method,
					headers: {
						...req.headers,
						"content-length": body ? Buffer.byteLength(body).toString() : undefined
					},
					body: body
				});
			}
			else {
				response = await fetch(URL, {
					method: req.method,
					headers: req.headers
				});
			}

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