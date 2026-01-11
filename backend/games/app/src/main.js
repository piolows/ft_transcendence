import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pongHandler from  "./handlers/pong.controller.js";
import fastifyCors from "@fastify/cors";
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
	
	await fastify.register(websocketPlugin, {
		options: {
			verifyClient: (info, next) => {
				// Accept connections proxied through nginx
				// Check X-Forwarded-Proto header set by nginx or HTTPS origin
				const proto = info.req.headers['x-forwarded-proto'];
				const origin = info.origin || "";
				if (proto === 'https' || origin.startsWith("https://")) {
					next(true);
				} else {
					// In development, also allow direct connections
					next(true);
				}
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
