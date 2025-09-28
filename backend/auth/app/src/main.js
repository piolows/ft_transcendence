import Fastify from "fastify";
import endpointHandler from "./handler.controller.js";
import sqlite from './plugins/fastify-sqlite.js';
import formBody from '@fastify/formbody';
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	await fastify.register(fastifyCookie);
	await fastify.register(fastifySession, {
	secret: process.env.SESSION_SECRET,
	cookie: {
		secure: false, // true in production (HTTPS required)
		httpOnly: true,
		sameSite: "lax"
	}
	});

	fastify.register(sqlite, {
		dbFile: process.env.DB_FILE
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
