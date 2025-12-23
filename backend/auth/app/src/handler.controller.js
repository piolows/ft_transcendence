import { OAuth2Client } from 'google-auth-library';
import * as argon2 from 'argon2';
import { deleteSchema, loginSchema, registerSchema, googleLoginSchema } from './schemas.js';
import { hash, validate_registration, save_pfp } from './utils.js';

const endpointHandler = (fastify, options, done) => {
	fastify.get("/me", async (req, reply) => {
		if (req.session && req.session.user) {
			return reply.send({ success: true, loggedIn: true, user: req.session.user });
		}
		return reply.send({ success: true, loggedIn: false });
	});

	fastify.post("/login", loginSchema, async (req, reply) => {
		if (req.contentLength === 0 || !req.body)
			return reply.send({ success: false, code: 400, source: "/auth/login", error: "Empty body" });
		if (req.session && req.session.user)
			return reply.send({ success: false, code: 403, source: "/auth/login", error: "Already logged in. Logout first" });
		try {
			if (!req.session) {
				req.session.init();
			}
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.send({ success: false, code: 404, source: "/auth/login", error: "User not found" });
			}
			if (user['password'] == null) {
				return reply.send({ success: false, code: 403, source: "/auth/login", error: "Google-login or Signup required for password" });
			}
			if (!await argon2.verify(user['password'], req.body.password)) {
				return reply.send({ success: false, code: 403, source: "/auth/login", error: "Wrong password" });
			}
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			req.session.save();
			fetch(process.env.USERS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(req.session.user)
			}).then(response => response.json()).then(data => console.log(data)).catch(error => console.log(error));
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/auth/login", error: error.message });
		}
	});

	fastify.post("/register", registerSchema, async (req, reply) => {
		try {
			if (!req.session) {
				req.session.init();
			}

			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (user && (user['email'] != req.body.email || user['password'] != null)) {
				return reply.send({ success: false, code: 403, source: "/auth/register", error: 'User already exists' });
			}

			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			const valReg = validate_registration(user, req);
			if (valReg) {
				return reply.send(valReg);
			}

			const password = await hash(req.body.password);
			const avatarURI = req.body.avatarURL && req.body.avatarURL != "" ? await save_pfp(req.body.avatarURL) : process.env.DEFAULT_PIC;
			if (user)
				await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET username=?, email=?, password=?, avatarURL=? WHERE email=?`).run(req.body.username, req.body.email, password, avatarURI, req.body.email);
			else
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`).run(req.body.username, req.body.email, password, avatarURI);
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email);
			await fetch(`${process.env.USERS_URL}`, {
				method: "POST",
				body: {
					id: user['id'],
					username: user['username'],
					email: user['email'],
					avatarURL: user['avatarURL'],
				}
			});
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: avatarURI };
			req.session.save();
			fetch(process.env.USERS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(req.session.user)
			}).then(response => response.json()).then(data => console.log(data)).catch(error => console.log(error));
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/auth/register", error: error.message });
		}
	});

	fastify.post("/update", async (req, reply) => {
		try {
			if (!req.session || !req.session.user)
				return reply.send({ success: false, code: 403, source: "/auth/update", error: "Must be signed in" });
			if (!req.body.email)
				return reply.send({ success: false, code: 400, source: "/auth/update", error: "Must include email in body" });
			if (req.body.email.value != req.session.user.email)
				return reply.send({ success: false, code: 403, source: "/auth/update", error: "Can only update own account" });
			if (req.body.newpassword && !req.body.password)
				return reply.send({ success: false, code: 403, source: "/auth/update", error: "Old password required for password update" });
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email.value);
			if (!user)
				return reply.send({ success: false, code: 404, source: "/auth/update", error: "User not found" });
			if (req.body.password && !await argon2.verify(user['password'], req.body.password.value))
				return reply.send({ success: false, code: 403, source: "/auth/update", error: "Wrong password provided" });
			if (req.body.newpassword && await argon2.verify(user['password'], req.body.newpassword.value))
				return reply.send({ success: false, code: 400, source: "/auth/update", error: "Same as old password" });
			if (req.body.username?.value == user['username'])
				return reply.send({ success: false, code: 400, source: "/auth/update", error: "Same as old username" });
			if (req.body.username && req.body.username.value) {
				const newuser = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username.value);
				if (newuser)
					return reply.send({ success: false, code: 403, source: "/auth/update", error: "Username already taken" });
			}

			const valReg = validate_registration(user, req, true);
			if (valReg)
				return reply.send(valReg);

			const username = req.body.username?.value ?? user['username'];
			const password = req.body.newpassword?.value ? await hash(req.body.newpassword?.value) : user['password'];
			let newUrl = "";
			if (req.body.avatarFile && req.body.avatarFile.file.bytesRead > 0)
			{
				try {
					const file = req.body.avatarFile;
					const buffer = await file.toBuffer();

					const resp = await fetch(`${process.env.CDN_URL}/upload-image`, {
						method: 'POST',
						body: buffer,
						headers: {
							'content-type': file.mimetype,
							'content-length': buffer.length.toString(),
							'x-filename': file.filename,
						},
					});
					if (!resp.ok) {
						console.error(`Avatar upload failed1: ${resp.status} - ${resp.message}`);
						return reply.send({ success: false, code: 500, source: "/auth/update", error: "Unexpected error while trying to save uploaded file." });
					}
					const data = await resp.json();
					if (!data) {
						console.error(`Avatar upload failed2: ${resp.status} - ${resp.message}`);
						return reply.send({ success: false, code: 500, source: "/auth/update", error: "Unexpected error while trying to save uploaded file." });
					}
					if (!data.success) {
						console.error(`Error while sending request: ${data.code} - ${data.source} - ${data.error}`);
						return reply.send(data);
					}
					newUrl = data.public_url;
				} catch (error) {
					console.error(error.message);
					return reply.send({ success: false, code: 500, source: "/auth/update", error: `Unexpected error while trying to save uploaded file: ${error}` });
				}
			}
			const avatarURI = newUrl != "" ? newUrl : (req.body.avatarURL?.value && req.body.avatarURL?.value != "" ? await save_pfp(req.body.avatarURL?.value) : user['avatarURL']);
			await fastify.sqlite.prepare(`UPDATE ${process.env.USERS_TABLE} SET username=?, email=?, password=?, avatarURL=? WHERE email=?`).run(username, req.body.email?.value, password, avatarURI, req.body.email?.value);
			user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(req.body.email?.value);
			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: avatarURI };
			req.session.save();
			fetch(process.env.USERS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(req.session.user)
			}).then(response => response.json()).then(data => console.log(data)).catch(error => console.log(error));
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/auth/update", error: error.message });
		}
	});

	fastify.post("/google-login", googleLoginSchema, async (req, reply) => {
		try {
			if (!req.session) {
				req.session.init();
			}
			const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
	
			// Verify the token
			const ticket = await client.verifyIdToken({
				idToken: req.body.token,
				audience: process.env.GOOGLE_CLIENT_ID
			});

			const payload = ticket.getPayload();
			if (!payload)
				return reply.send({ succes: false, code: 500, source: "/auth/google-login", error: "Invalid Google payload"});
			const { sub, email, name, picture } = payload;

			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);
			if (!user) {
				const avatarURI = await save_pfp(picture);
				await fastify.sqlite.prepare(`INSERT INTO ${process.env.USERS_TABLE} (username, email, password, avatarURL) VALUES (?, ?, ?, ?)`)
					.run(name, email, null, avatarURI);
				user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE email=?`).get(email);
			}

			req.session.user = { id: user['id'], username: user['username'], email: user['email'], avatarURL: user['avatarURL'] };
			req.session.save();
			fetch(process.env.USERS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(req.session.user)
			}).then(response => response.json()).then(data => console.log(data)).catch(error => console.log(error));
			reply.send({ success: true, user: req.session.user });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/auth/google-login", error: error.message });
		}
	});

	fastify.post("/logout", async (req, reply) => {
		try {
			if (!req.session || !req.session.user) {
				return reply.send({ succes: false, code: 401, source: "/auth/logout", error: 'Not logged in!' });
			}
			let user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=? OR email=?`).get(req.session.user.username, req.session.user.email);
			if (!user)
				return reply.send({ succes: false, code: 404, source: "/auth/logout", error: 'User not found!' });
			if (user['id'] != req.session.user.id || user['username'] != req.session.user.username || user['email'] != req.session.user.email) {
				return reply.send({ succes: false, code: 403, source: "/auth/logout", error: 'Credentials do not match cookie!' });
			}
			req.session.destroy();
			return reply.send({ success: true });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/auth/logout", error: error.message });
		}
	});

	fastify.delete("/", deleteSchema, async (req, reply) => {
		try {
			const user = await fastify.sqlite.prepare(`SELECT * FROM ${process.env.USERS_TABLE} WHERE username=?`).get(req.body.username);
			if (!user) {
				return reply.send({ success: false, code: 404, source: "/auth/delete", error: 'User does not exists!' });
			}
			if (!await argon2.verify(user['password'], req.body.password)) {
				return reply.send({ success: false, code: 403, source: "/auth/delete", error: "Wrong password" });
			}
			await fastify.sqlite.prepare(`DELETE FROM ${process.env.USERS_TABLE} WHERE username=?`).run(req.body.username);
			return reply.send({ success: true });
		} catch (error) {
			return reply.send({ success: false, code: 500, source: "/auth/delete", error: error.message });
		}
	});

	done();
};

export default endpointHandler;