import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pongHandler from  "./pong.controller.js";
// import roshamboHandler from "./roshambo.controller.js";
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
