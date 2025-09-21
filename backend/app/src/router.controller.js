const router = (fastify, options, done) => {
	fastify.get("/:username", {
		'schema': {
			'params': {
				'properties': {
					'username': { 'type': 'string' }
				},
				'required': [ 'username' ]
			}
		}
	}, async (req, reply) => {
		// try {
		// 	const user = await fastify.sqlite.first('SELECT * FROM users WHERE username=?', req.params.username);
		// 	if (!user) {
		// 		return reply.code(404).send({ error: "User not found" });
		// 	}
		// 	return reply.send(`Hello ${req.params.username} with email ${ user['email'] }!`);
		// } catch (error) {
		// 	return reply.send(error);
		// }
		return reply.send(`Hello ${req.params.username}!`);// with email ${ user['email'] }!`);
	});
	done();
};

export default router;