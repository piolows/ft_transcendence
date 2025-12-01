const endpointHandler = (fastify, options, done) => {
	fastify.all("/auth/*", async (req, reply) => {
		try {
			const subPath = req.params["*"] ?? "";
			const queryString = req.raw.url.includes("?") ? "?" + req.raw.url.split("?")[1] : "";
			const serviceURI = process.env.AUTH_URL + (process.env.AUTH_URL.endsWith("/") ? "" : "/");
			const URL = `${serviceURI}${subPath}${queryString}`;

			let response = undefined;
			const contentType = req.headers["content-type"] ?? "";
			if (req.body) {
				let body = undefined;
				if (Object.keys(req.body).length > 0) {
					if (contentType.includes("application/json")) {
						body = JSON.stringify(req.body);
					} else if (contentType.includes("application/x-www-form-urlencoded")) {
						body = new URLSearchParams(req.body).toString();
					} else {
						body = req.body;
					}
				}

				const headers = { ...req.headers };

				if (body) {
					headers["content-length"] = Buffer.byteLength(body).toString();
				} else {
					delete headers["content-length"];
				}

				response = await fetch(URL, {
					method: req.method,
					headers,
					...(body ? { body } : {}),
				});
			}
			else {
				response = await fetch(URL, {
					method: req.method,
					headers: req.headers
				});
			}
			reply.status(response.status);
			for (const [key, value] of response.headers.entries()) {
				reply.header(key, value);
			}
			if (!response) {
				return reply.send({ success: false, code: 500, error: "Something went wrong during communication with microservices." });
			}
			return reply.send(response.body);
		} catch (error) {
			console.log(error);
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.all('/cdn/*', async (req, reply) => {
		try {
			const URL = `${process.env.CDN_URL}${req.url.substring(process.env.CDN_URL.endsWith('/') ? 1 : 0)}`;
			let response = undefined;
			const contentType = req.headers["content-type"] ?? "";
			let body = undefined;
			if (contentType.startsWith('multipart/form-data')) {
				body = req.body;
				console.log("JSH8er");
			}
			if (req.body && Object.keys(req.body).length > 0) {
				if (contentType.includes("application/json")) {
					body = JSON.stringify(req.body);
				} else if (contentType.includes("application/x-www-form-urlencoded")) {
					body = new URLSearchParams(req.body).toString();
				} else {
					body = req.body;
				}
			}

			const headers = { ...req.headers };

			if (body) {
				headers["content-length"] = Buffer.byteLength(body).toString();
			} else {
				delete headers["content-length"];
			}

			response = await fetch(URL, {
				method: req.method,
				headers,
				...(body ? { body } : {}),
			});
			reply.status(response.status);
			for (const [key, value] of response.headers.entries()) {
				reply.header(key, value);
			}
			if (!response) {
				return reply.send({ success: false, code: 500, error: "Something went wrong during communication with microservices." });
			}
			return reply.send(response.body);
		} catch (error) {
			console.log(error);
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.all('/users/*', async (req, reply) => {
		try {
			const URL = `${process.env.USERS_URL}${req.url.substring(process.env.USERS_URL.endsWith('/') ? 1 : 0)}`;

			let response = undefined;
			const contentType = req.headers["content-type"] ?? "";
			let body = undefined;
			if (req.body && Object.keys(req.body).length > 0) {
				if (contentType.includes("application/json")) {
					body = JSON.stringify(req.body);
				} else if (contentType.includes("application/x-www-form-urlencoded")) {
					body = new URLSearchParams(req.body).toString();
				} else {
					body = req.body;
				}
			}

			const headers = { ...req.headers };

			if (body) {
				headers["content-length"] = Buffer.byteLength(body).toString();
			} else {
				delete headers["content-length"];
			}

			response = await fetch(URL, {
				method: req.method,
				headers,
				...(body ? { body } : {}),
			});
			reply.status(response.status);
			for (const [key, value] of response.headers.entries()) {
				reply.header(key, value);
			}
			if (!response) {
				return reply.send({ success: false, code: 500, error: "Something went wrong during communication with microservices." });
			}
			return reply.send(response.body);
		} catch (error) {
			console.log(error);
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	done();
};

export default endpointHandler;