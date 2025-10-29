import fp from 'fastify-plugin';
import Database from 'better-sqlite3';

async function fastifyBetterSqlite3(fastify, options) {
	const db = new Database(options.dbFile ?? ':memory:');
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	fastify.decorate('sqlite', db);

	fastify.addHook('onClose', (instance, done) => {
		instance.betterSqlite3.close();
		done();
});
}

export default fp(fastifyBetterSqlite3);