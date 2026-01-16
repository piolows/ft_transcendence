import Fastify from "fastify";
import endpointHandler from "./handler.controller.js";
import sqlite from './plugins/fastify-sqlite.js';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from "@fastify/cookie";
import fastifyCors from '@fastify/cors';
import fastifySession from "@fastify/session";
import createSqliteStore from "better-sqlite3-session-store";
import Database from 'better-sqlite3';
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
			secure: true,
			httpOnly: true,
			sameSite: "none",
			maxAge: ONEDAY
		},
		store: new SqliteStore({
			client: new Database(process.env.SESSIONS_DB),
			table: "sessions"
		})
	});

	await fastify.register(sqlite, {
		dbFile: process.env.DB_FILE
	});

	await fastify.register(fastifyCors, {
		origin: true, // Accept any origin (since requests are proxied through frontend)
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	await fastify.register(fastifyMultipart, {
    	attachFieldsToBody: true,
		limits: {
			fileSize: 50 * 1024 * 1024,
			files: 1
		}
	});

	await fastify.register(endpointHandler);

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
