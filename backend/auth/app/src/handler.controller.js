import { OAuth2Client } from 'google-auth-library';
import * as argon2 from 'argon2';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

async function hash(password) {
	try {
		const hashed = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,     // Memory cost in KiB (e.g., 64MB)
      timeCost: 3,           // Number of iterations
      parallelism: 1         // Number of threads
    });
		return hashed;
	} catch(err) {
		throw err;
	}
}

function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

function getExt(url, contentType) {
	const fromUrl = path.extname(new URL(url).pathname);
	if (fromUrl) return fromUrl;

	if (contentType) {
		const mapping = {
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"image/gif": ".gif",
			"image/webp": ".webp",
			"image/bmp": ".bmp",
			"image/svg+xml": ".svg",
		};
		return mapping[contentType] || ".png";
	}
	return ".png";
}

async function saveURL(url, contentType)
{
	const response = await fetch(url);
	if (!response.ok) {
		return "";
	}
	const buffer = Buffer.from(await response.arrayBuffer());
	const ext = getExt(url, contentType);
	const filename = `${shortUUID()}${ext}`;
	const savePath = path.join(process.cwd(), "/uploads/avatars", filename);

	await fs.mkdir(path.dirname(savePath), { recursive: true });
	await fs.writeFile(savePath, buffer);

	return filename;
}

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
			if (!await argon2.verify(user['password'], req.body.password)) {
				return reply.code(403).send({ error: "Wrong password" });
			}
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			reply.send({ user: req.session.user });
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
				return reply.code(403).send({ error: 'User already exists' });
			}

			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			if (user && user['password'] != null) {
				return reply.code(403).send({ error: 'User already exists' });
			}
			if (req.body.username.length < 3) {
				return reply.code(400).send({ error: 'Username too short: min 3' });
			}
			if (req.body.username.length > 20) {
				return reply.code(400).send({ error: 'Username too long: max 20' });
			}

			const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
			if (!email_regex.test(req.body.email)) {
				return reply.code(400).send({ error: 'Invalid email format' });
			}
			if (req.body.password.length < 8) {
				return reply.code(400).send({ error: 'Password too short: min 8' });
			}
			if (req.body.password.length > 64) {
				return reply.code(400).send({ error: 'Password too long: max 64' });
			}
			if (req.body.password.includes(req.body.username) || req.body.password.includes(req.body.email.split('@')[0])) {
				return reply.code(400).send({ error: 'Unsafe password: Must not contain username or email address' });
			}

			const password_regex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_]).{8,64}$/;
			if (!password_regex.test(req.body.password)) {
				return reply.code(400).send({ error: 'Unsafe password: Must contain at least 1 Small letter, 1 Capital letter, 1 Digit and 1 Symbol' });
			}

			const url_regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?)$/i;
			if (req.body.avatarURL && !url_regex.test(req.body.avatarURL)) {
				return reply.code(400).send({ error: 'Invalid email' });
			}

			const password = await hash(req.body.password);
			let avatarURL = process.env.DEFAULT_PIC;
			if (req.body.avatarURL && req.body.avatarURL != "") {
				try {
					avatarURL = await saveURL(req.body.avatarURL);
					if (avatarURL === "") {
						throw new Error("Failed to fetch avatar image");
					}
					avatarURL = "/avatars/" + avatarURL;
				} catch (err) {
					return reply.code(500).send(err.message);
				}
			}

			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			if (user)
				await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET username=?, email=?, password=?, avatarURL=? WHERE email=?`).run(req.body.username, req.body.email, password, avatarURL, req.body.email);
			else
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`).run(req.body.username, req.body.email, password, avatarURL);

			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: avatarURL };
			reply.send({ user: req.session.user });
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

			// add user to the database
			if (!user) {
				const url = picture;
				let avatarURI = process.env.DEFAULT_PIC;
				try {
					avatarURI = "/avatars/" + await saveURL(url);
					if (avatarURI === "") {
						throw new Error("Failed to fetch avatar image");
					}
				} catch (err) {
					return reply.code(500).send(err.message);
				}
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`)
					.run(name, email, null, avatarURI);
				user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);
			}

			// Create a session (just like normal login)
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			reply.send({ user: req.session.user });
		} catch (error) {
			return reply.send(error);
		}
	});

	done();
};

export default endpointHandler;