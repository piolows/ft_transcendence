import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pongHandler from  "./pong.controller";
import roshamboHandler from "./roshambo.controller";
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true
	});
	
	await fastify.register(websocketPlugin);

	await fastify.register(pongHandler, { prefix: "/pong" });
	await fastify.register(roshamboHandler, { prefix: "/roshambo" });

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
