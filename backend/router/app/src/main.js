import Fastify from "fastify";
import router from "./router.controller.js";
import sqlite from './plugins/fastify-sqlite.js';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	fastify.register(sqlite, {
		'dbFile': '/app/src/database/test.db'
	});

	fastify.register(router, { prefix: '/user' });

	fastify.listen({ port: 4161, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();