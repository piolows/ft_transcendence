const router = (fastify, options, done) => {
	fastify.get("/:username", {
		'schema': {
			'params': {
				'type': 'object',
				'properties': {
					'username': { 'type': 'string' }
				},
				'required': [ 'username' ]
			}
		}
	}, async (req, reply) => {
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
	done();
};

export default router;