import Fastify from "fastify";
import formBody from '@fastify/formbody';
import endpointHandler from "./handler.controller.js";
import fastifyCors from "@fastify/cors";
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	await fastify.register(formBody);

	// Enable CORS
	await fastify.register(fastifyCors, {
		origin: ["http://localhost:4116"], // allow your frontend
		credentials: true,                 // allow cookies / session
	});

	await fastify.register(endpointHandler);

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
