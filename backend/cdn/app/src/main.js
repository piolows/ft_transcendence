import Fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';
import endpointHandler from './handler.controller.js';
import 'dotenv/config';

async function startSever() {
	const fastify = Fastify({
		logger: true,
		bodyLimit: 10 * 1024 * 1024,
	});

	// await fastify.register(fastifyCors, {
	// 	origin: process.env.FRONTEND_URL,
	// 	credentials: true
	// });

	await fastify.register(fastifyCors, {
		origin: [process.env.FRONTEND_URL],
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	await fastify.register(fastifyMultipart, {
    	attachFieldsToBody: true,
		limits: {
			fileSize: 5 * 1024 * 1024,
			files: 1
		}
	});

	await fastify.register(fastifyStatic, {
		root: path.join(process.cwd(), 'public', 'uploads'),
		cacheControl: true,
		maxAge: '1d',
	});

	await fastify.register(endpointHandler);

	fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startSever();
