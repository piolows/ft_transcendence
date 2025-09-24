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

	const postSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				email: { type: 'email' }
			},
			required: [ 'username', 'email' ]
		}
	}

	const deleteSchema = {
		body: {
			properties: {
				username: { type: 'string' }
			},
			required: [ 'username' ]
		}
	}

	fastify.get("/:username", getUserSchema, async (req, reply) => {
		try {
			const statement = fastify.sqlite.prepare('SELECT * FROM users WHERE username=?');
			const user = await statement.get(req.params.username);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}
			return reply.send(`Hello ${req.params.username} with email ${ user['email'] }!`);
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/", postSchema, async (req, reply) => {
		try {
			const userfind = fastify.sqlite.prepare('SELECT * FROM users WHERE username=? OR email=?');
			const user = await userfind.get(req.body.username, req.body.email);
			if (user) {
				return reply.code(403).send({ error: 'User already exists!' });
			}
			const statement = fastify.sqlite.prepare('INSERT INTO users (username,email) VALUES (?,?)');
			await statement.run(req.body.username, req.body.email);
			return reply.send(`Registered ${req.body.username} with email ${ req.body.email }!`);
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.delete("/", deleteSchema, async (req, reply) => {
		try {
			const userfind = fastify.sqlite.prepare('SELECT * FROM users WHERE username=?');
			const user = await userfind.get(req.body.username);
			if (!user) {
				return reply.code(404).send({ error: 'User does not exists!' });
			}
			const statement = fastify.sqlite.prepare('DELETE FROM users WHERE username=?');
			await statement.run(req.body.username);
			return reply.send(`Deleted ${req.body.username}!`);
		} catch (error) {
			return reply.send(error);
		}
	});

	done();
};

export default endpointHandler;