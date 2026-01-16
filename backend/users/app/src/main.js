import Fastify from "fastify";
import endpointHandler from "./handler.controller.js";
import sqlite from './plugins/fastify-sqlite.js';
import fastifyCors from '@fastify/cors';
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	await fastify.register(sqlite, {
		dbFile: process.env.DB_FILE,
	});

	await fastify.register(fastifyCors, {
		origin: true, // Accept any origin (since requests are proxied through frontend)
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	await fastify.register(endpointHandler);

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
