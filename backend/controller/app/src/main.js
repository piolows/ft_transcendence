import Fastify from "fastify";
import formBody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
// import endpointHandler from "./handler.controller.js";
import fastifyCors from "@fastify/cors";
import proxy from "@fastify/http-proxy";
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true,
	});

	// Enable CORS
	await fastify.register(fastifyCors, {
		origin: true, // Accept any origin (since requests are proxied through frontend)
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	await fastify.register(proxy, {
		upstream: process.env.AUTH_URL,
		prefix: '/auth',
	});

	await fastify.register(proxy, {
		upstream: process.env.USERS_URL,
		prefix: '/users',
	});

	await fastify.register(proxy, {
		upstream: process.env.CDN_URL,
		prefix: '/cdn',
	});

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
