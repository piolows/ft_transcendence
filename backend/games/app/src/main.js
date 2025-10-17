import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pongHandler from  "./pong.controller.js";
// import roshamboHandler from "./roshambo.controller.js";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import createSqliteStore from "better-sqlite3-session-store";
import Database from 'better-sqlite3';
import fastifyCors from "@fastify/cors";
import fs from "fs";
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true,
		https: {
			cert: fs.readFileSync("/app/certs/localhost-cert.pem"),
			key: fs.readFileSync("/app/certs/localhost-key.pem")
		}
	});

	const ONEDAY = 1000 * 60 * 60 * 24;
	const SqliteStore = createSqliteStore(fastifySession);

	// Enable CORS
	await fastify.register(fastifyCors, {
		origin: [process.env.FRONTEND_URL],
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

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
	
	await fastify.register(websocketPlugin, {
		options: {
			verifyClient: (info, next) => {
				const allowed = ["https://localhost"];
				if (allowed.includes(info.origin))
					next(true);
				else
					next(false, 403, "Origin not allowed");
			}
		}
	});

	await fastify.register(pongHandler, { prefix: "/pong" });
	// await fastify.register(roshamboHandler, { prefix: "/roshambo" });

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
