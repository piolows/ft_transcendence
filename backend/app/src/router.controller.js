const router = (fastify, options, done) => {
	fastify.get("/", (req, reply) => {
		reply.send("Yo!");
	});
	done();
};

export default router;