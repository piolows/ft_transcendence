import Fastify from "fastify";
import endpointHandler from "./handler.controller.js";
import sqlite from './plugins/fastify-sqlite.js';
import formBody from '@fastify/formbody'
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	fastify.register(sqlite, {
		dbFile: process.env.DB_FILE
	});

	fastify.register(formBody);

	fastify.register(endpointHandler, { prefix: '/auth' });

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
