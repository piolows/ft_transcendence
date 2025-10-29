import { OAuth2Client } from 'google-auth-library';
import * as argon2 from 'argon2';
import { getUserSchema, deleteSchema, loginSchema, registerSchema, updateSchema, googleLoginSchema } from './schemas.js';
import { hash, validate_registration, save_pfp } from './utils.js';

const endpointHandler = (fastify, options, done) => {
	fastify.get("/me", async (req, reply) => {
		if (req.session?.user) {
			return reply.send({ loggedIn: true, user: req.session.user });
		}
		return reply.send({ loggedIn: false });
	});

	fastify.post("/login", loginSchema, async (req, reply) => {
		if (req.contentLength === 0 || !req.body)
			return reply.code(400).send({ error: "Empty body" });
		try {
			if (!req.session) {
				req.session.init();
			}
			if (req.session.user) {
				req.session.user = null;
			}
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.send({ success: false, code: 404, error: "User not found" });
			}
			if (user['password'] == null) {
				return reply.send({ success: false, code: 403, error: "Account only registered through google sign-in, try signing up with the same email" });
			}
			if (!await argon2.verify(user['password'], req.body.password)) {
				return reply.send({ success: false, code: 403, error: "Wrong password" });
			}
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/register", registerSchema, async (req, reply) => {
		try {
			if (!req.session) {
				req.session.init();
			}
			if (req.session.user) {
				req.session.user = null;
			}

			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (user && (user['email'] != req.body.email || user['password'] != null)) {
				return reply.send({ success: false, code: 403, error: 'User already exists' });
			}

			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			const valReg = validate_registration(user, req);
			if (valReg) {
				return reply.send(valReg);
			}

			const password = await hash(req.body.password);
			const avatarURI = req.body.avatarURL && req.body.avatarURL != "" ? await save_pfp(req.body.avatarURL) : process.env.DEFAULT_PIC;
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			if (user)
				await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET username=?, email=?, password=?, avatarURL=? WHERE email=?`).run(req.body.username, req.body.email, password, avatarURI, req.body.email);
			else
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`).run(req.body.username, req.body.email, password, avatarURI);
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			await fetch(`${process.env.USERS_URL}/users`, {
				method: "POST",
				body: {
					id: user['id'],
					username: user['username'],
					email: user['email'],
					avatarURL: user['avatarURL'],
				}
			});
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: avatarURI };
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/update", async (req, reply) => {
		try {
			if (!req.session || !req.session.user)
				return reply.send({ success: false, code: 403, error: "Must be signed in" });
			if (!req.body.email)
				return reply.send({ success: false, code: 400, error: "Must include email in body" });
			if (req.body.email != req.session.user.email)
				return reply.send({ success: false, code: 403, error: "Can only update own account" });

			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			if (!user) {
				return reply.send({ success: false, code: 404, error: "User not found" });
			}

			const valReg = validate_registration(user, req, true);
			if (valReg)
				return reply.send(valReg);

			const username = req.body.username ?? user['avatarURL'];
			const password = req.body.password ?? user['avatarURL'];
			const avatarURI = req.body.avatarURL && req.body.avatarURL != "" ? await save_pfp(req.body.avatarURL) : user['avatarURL'];
			await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET username=?, email=?, password=?, avatarURL=? WHERE email=?`).run(username, req.body.email, password, avatarURI, req.body.email);
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			await fetch(`${process.env.USERS_URL}/users`, {
				method: "POST",
				body: {
					id: user['id'],
					username: user['username'],
					email: user['email'],
					avatarURL: user['avatarURL'],
				}
			});
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: avatarURI };
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.post("/google-login", googleLoginSchema, async (req, reply) => {
		try {
			if (!req.session) {
				req.session.init();
			}
			if (req.session.user) {
				req.session.user = null;
			}
			const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
	
			// Verify the token
			const ticket = await client.verifyIdToken({
				idToken: req.body.token,
				audience: process.env.GOOGLE_CLIENT_ID
			});

			const payload = ticket.getPayload();
			if (!payload)
				return reply.send({ succes: false, code: 500, error: "Invalid Google payload"});
			const { sub, email, name, picture } = payload;

			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);
			if (!user) {
				const avatarURI = await save_pfp(picture);
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`)
					.run(name, email, null, avatarURI);
				user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);
			}

			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.post("/logout", async (req, reply) => {
		try {
			if (!req.session || !req.session.user) {
				return reply.send({ succes: false, code: 401, error: 'Not logged in!' });
			}
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=? OR email=?`).get(req.session.user.username, req.session.user.email);
			if (!user)
				return reply.send({ succes: false, code: 404, error: 'User not found!' });
			if (user['id'] != req.session.user.id || user['username'] != req.session.user.username || user['email'] != req.session.user.email) {
				return reply.send({ succes: false, code: 403, error: 'Credentials do not match cookie!' });
			}
			req.session.destroy();
			return reply.send({ success: true });
		} catch (error) {
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	fastify.delete("/", deleteSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.send({ success: false, code: 404, error: 'User does not exists!' });
			}
			if (req.body.password != user['password']) {
				return reply.send({ success: false, code: 403, error: 'Incorrect password!' });
			}
			await fastify.sqlite.prepare(`DELETE FROM ${process.env.USERS_TABLE} WHERE username=?`).run(req.body.username);
			return reply.send({ success: true });
		} catch (error) {
			return reply.send({ success: false, code: 500, error: error.message });
		}
	});

	done();
};

export default endpointHandler;