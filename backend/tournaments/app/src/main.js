import { tournamentHandler } from "./handlers/tournaments.js";
import Fastify from "fastify";
import 'dotenv/config';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import createSqliteStore from 'better-sqlite3-session-store';
import Database from "better-sqlite3";

async function startServer() {
    const fastify = Fastify({
        logger: true,
        bodyLimit: 10 * 1024 * 1024
    });
    const SqliteStore = createSqliteStore(fastifySession);
    const ONEDAY = 1000 * 60 * 60 * 24;
    
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

    // await fastify.register(tournamentHandler, { prefix: "/tournaments" });
    await fastify.register(tournamentHandler);

    fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
		.catch(error => {
			fastify.log.error(error);
			process.exit(1);
		});
}

startServer();