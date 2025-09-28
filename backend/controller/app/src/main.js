import Fastify from "fastify";
import formBody from '@fastify/formbody';
import endpointHandler from "./handler.controller.js";
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	fastify.register(formBody);

	fastify.register(endpointHandler);

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
