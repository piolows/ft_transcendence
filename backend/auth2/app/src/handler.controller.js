const endpointHandler = (fastify, options, done) => {
	const getUserSchema = {
		schema: {
			params: {
				type: 'object',
				properties: {
					username: { type: 'string' }
				},
				required: [ 'username' ]
			}
		}
	}

	const loginSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				password: { type: 'password' }
			},
			required: [ 'username', 'password' ]
		}
	}

	const registerSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				email: { type: 'email' },
				password: { type: 'password' }
			},
			required: [ 'username', 'email', 'password' ]
		}
	}

	const deleteSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				password: { type: 'string' }
			},
			required: [ 'username', 'password' ]
		}
	}

	fastify.get("/:username", getUserSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare('SELECT * FROM users WHERE username=?').get(req.params.username);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}
			return reply.send(`Hello ${req.params.username} with email ${ user['email'] }! Don't tell anyone that your password is ${ user['password'] }`);
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/login", loginSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare('SELECT * FROM users WHERE username=?').get(req.body.username);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}
			if (user['password'] != req.body.password) {
				return reply.code(403).send({ error: "Wrong password!" });
			}
			return reply.send(`Hello ${req.body.username} with email ${ user['email'] }! Don't tell anyone that your password is ${ user['password'] }`);
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/register", registerSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare('SELECT * FROM users WHERE username=? OR email=?').get(req.body.username, req.body.email);
			if (user) {
				return reply.code(403).send({ error: 'User already exists!' });
			}
			await fastify.sqlite.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(req.body.username, req.body.email, req.body.password);
			return reply.send(`Registered ${req.body.username} with email ${ req.body.email } and password ${ req.body.password }!`);
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.delete("/", deleteSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare('SELECT * FROM users WHERE username=?').get(req.body.username);
			if (!user) {
				return reply.code(404).send({ error: 'User does not exists!' });
			}
			if (req.body.password != user['password']) {
				return reply.code(403).send({ error: 'Incorrect password!' });
			}
			await fastify.sqlite.prepare('DELETE FROM users WHERE username=?').run(req.body.username);
			return reply.send(`Deleted ${req.body.username}!`);
		} catch (error) {
			return reply.send(error);
		}
	});

	done();
};

export default endpointHandler;