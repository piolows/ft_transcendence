import { OAuth2Client } from 'google-auth-library';

const endpointHandler = (fastify, options, done) => {
	const getUserSchema = {
		schema: {
			params: {
				type: 'object',
				properties: {
					username: { type: 'string' }
				},
				required: [ 'username' ]
			}
		}
	}

	const loginSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				password: { type: 'password' }
			},
			required: [ 'username', 'password' ]
		}
	}

	const googleLoginSchema = {
		body: {
			properties: {
				token: { type: 'string' }
			},
			required: [ 'token' ]
		}
	}

	const registerSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				email: { type: 'email' },
				password: { type: 'password' },
				avatarURL: { type: 'string' }
			},
			required: [ 'username', 'email', 'password' ]
		}
	}

	const deleteSchema = {
		body: {
			properties: {
				username: { type: 'string' },
				password: { type: 'string' }
			},
			required: [ 'username', 'password' ]
		}
	}

	fastify.get("/me", async (req, reply) => {
		if (req.session?.user) {
			return reply.send({ loggedIn: true, user: req.session.user });
		}
		return reply.send({ loggedIn: false });
	});

	fastify.get("/:username", getUserSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.params.username);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}
			if (!req.session || !req.session.user) {
				return reply.code(403).send({ error: "Must be signed in!" });
			}
			if (req.session.user.username != req.params.username) {
				return reply.code(403).send({ error: "Can't view contents of another user!" });
			}
			return reply.send(`Hello ${req.params.username} with email ${ user['email'] }! Don't tell anyone that your password is ${ user['password'] }\n<img src="${ user['avatarURL'] }" />`);
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/login", loginSchema, async (req, reply) => {
		try {
			if (!req.session) {
				req.session.init();
			}
			if (req.session.user) {
				req.session.user = null;
			}
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.code(404).send({ error: "User not found" });
			}
			if (user['password'] == null) {
				return reply.code(402).send({ error: "Account only registered through google sign-in, try signing up with the same email" });
			}
			if (user['password'] != req.body.password) {
				return reply.code(403).send({ error: "Wrong password!" });
			}
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			return reply.send({ message: "Logged in successfully" });
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
			if (user) {
				return reply.code(403).send({ error: 'User already exists!' });
			}
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			if (user && user['password'] != null) {
				return reply.code(403).send({ error: 'User already exists!' });
			}
			if (req.body.username.length < 3 || req.body.username.length > 20) {
				return reply.code(400).send({ error: 'Username length should be between 3-20 characters' });
			}
			const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
			if (!email_regex.test(req.body.email)) {
				return reply.code(400).send({ error: 'Invalid email' });
			}
			if (req.body.password.length < 6 || req.body.password.length > 256) {
				return reply.code(400).send({ error: 'Invalid password length' });
			}
			const url_regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?)$/i;
			if (req.body.avatarURL && !url_regex.test(req.body.avatarURL)) {
				return reply.code(400).send({ error: 'Invalid email' });
			}
			const avatarURL = req.body.avatarURL && req.body.avatarURL != "" ? req.body.avatarURL : process.env.DEFAULT_PIC;
			if (user)
				await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET username=?, email=?, password=?, avatarURL=? WHERE email=?`).run(req.body.username, req.body.email, req.body.password, avatarURL, req.body.email);
			else
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`).run(req.body.username, req.body.email, req.body.password, avatarURL);
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: avatarURL };
			return reply.send({ message: "Logged in successfully" });
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.post("/logout", async (req, reply) => {
		try {
			if (!req.session || !req.session.user) {
				return reply.code(401).send({ error: 'Not logged in!' });
			}
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=? OR email=?`).get(req.session.user.username, req.session.user.email);
			if (!user)
				return reply.code(404).send({ error: 'User not found!' });
			if (user['id'] != req.session.user.id || user['username'] != req.session.user.username || user['email'] != req.session.user.email) {
				return reply.code(403).send({ error: 'Credentials do not match cookie!' });
			}
			req.session.destroy();
			return reply.send({ message: "Logged out successfully" });
		} catch (error) {
			return reply.send(error);
		}
	});

	fastify.delete("/", deleteSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.code(404).send({ error: 'User does not exists!' });
			}
			if (req.body.password != user['password']) {
				return reply.code(403).send({ error: 'Incorrect password!' });
			}
			await fastify.sqlite.prepare(`DELETE FROM ${process.env.USERS_TABLE} WHERE username=?`).run(req.body.username);
			return reply.send(`Deleted ${req.body.username}!`);
		} catch (error) {
			return reply.send(error);
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
				return reply.code(500).send("Invalid Google payload");

			const { sub, email, name, picture } = payload;

			// Upsert user in database
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);

			if (!user) {
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`)
					.run(name, email, null, picture);
				user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);
			}

			// Create a session (just like normal login)
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			reply.send({ success: true, user, message: "Logged in successfully" });
		} catch (error) {
			return reply.send(error);
		}
	});

	done();
};

export default endpointHandler;