import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pongHandler from  "./handlers/pong.controller.js";
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

	// Enable CORS
	await fastify.register(fastifyCors, {
		origin: true,
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
		// allowedHeaders: ['Content-Type', 'Authorization'],
	});
	
	await fastify.register(websocketPlugin, {
		options: {
			verifyClient: (info, next) => {
				const allowed = ["https://localhost:8443"];
				if (allowed.includes(info.origin))
					next(true);
				else
					next(false, 403, "Origin not allowed");
			}
		}
	});

	await fastify.register(pongHandler, { prefix: "/pong" });

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
