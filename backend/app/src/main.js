import Fastify from "fastify";
import sqlite from "@fastify/sqlite";
import router from "./router.controller.js";

const fastify = Fastify({
	logger: true
});

// fastify.register(sqlite, {
// 	'dbFile': 'test.db',
// 	'verbose': 'true',
// 	'promiseAPI': 'true'
// });

///////////////////// Method 1 /////////////////////

fastify.get("/", (req, reply) => {
	reply.send(`Hello ${req.query.name}!`);
});

fastify.register(router, { prefix: '/user' });

fastify.listen({ port: 4161, host: '0.0.0.0' })
	.catch(error => {
		fastify.log.error(error);
		process.exit(1);
	});