import Fastify from "fastify";
import router from "./router.controller.js";

const fastify = Fastify({
	logger: true
});

///////////////////// Method 1 /////////////////////

fastify.get("/", (req, reply) => {
	reply.send(`Hello ${req.query.name}!`);
});

///////////////////// Method 2 /////////////////////

// fastify.route({
// 	'method': 'GET',
// 	'url': '/',
// 	'handler': (req, reply) => {
// 		reply.send(`Hello ${req.query.name}!`);
// 	}
// });

fastify.register(router, { prefix: '/test' });

fastify.listen({ port: 4161, host: '0.0.0.0' })
	.catch(error => {
		fastify.log.error(error);
		process.exit(1);
	});