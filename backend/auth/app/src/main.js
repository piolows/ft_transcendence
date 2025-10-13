import Fastify from "fastify";
import endpointHandler from "./handler.controller.js";
import sqlite from './plugins/fastify-sqlite.js';
import formBody from '@fastify/formbody';
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import createSqliteStore from "better-sqlite3-session-store";
import Database from 'better-sqlite3';
import FastifyStatic from '@fastify/static';
import path from 'path';
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});

	const ONEDAY = 1000 * 60 * 60 * 24;
	const SqliteStore = createSqliteStore(fastifySession);
	await fastify.register(fastifyCookie);
	await fastify.register(fastifySession, {
		secret: process.env.SESSION_SECRET,
		cookie: {
			secure: process.env.NODE_ENV == "production",
			httpOnly: true,
			sameSite: "lax",
			maxAge: ONEDAY
		},
		store: new SqliteStore({
			client: new Database(process.env.SESSIONS_DB),
			table: "sessions"
		})
	});
	// await fastify.register(FastifyStatic, {
	// 	root: path.join(process.cwd(), '/uploads/avatars'),
	// 	prefix: '/avatars/', 
	// });

	await fastify.register(sqlite, {
		dbFile: process.env.DB_FILE
	});

	await fastify.register(formBody);


	await fastify.register(endpointHandler);

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
