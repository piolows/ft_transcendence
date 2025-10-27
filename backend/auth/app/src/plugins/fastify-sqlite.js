import fp from 'fastify-plugin';
import Database from 'better-sqlite3';

async function fastifyBetterSqlite3(fastify, options) {
  const db = new Database(options.dbFile || ':memory:'); // Use a file path or ':memory:' for in-memory DB
  db.pragma('journal_mode = WAL'); // Recommended for better performance and concurrency

  fastify.decorate('sqlite', db);

  fastify.addHook('onClose', (instance, done) => {
	instance.betterSqlite3.close();
	done();
  });
}

export default fp(fastifyBetterSqlite3);