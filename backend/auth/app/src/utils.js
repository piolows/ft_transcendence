import { randomUUID } from 'crypto';
import 'dotenv/config';
import * as argon2 from 'argon2';
import fetch from 'node-fetch';

export async function hash(password) {
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

export function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 5);
}

export function validate_registration(user, req, update = false) {
	if (user && user['password'] != null && !update) {
		return { success: false, code: 403, source: "/auth:validate_registration", error: 'User already exists' };
	}
	if (req.body.username?.value) {
		if (req.body.username?.value.length < 3) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Username too short: min 3' };
		}
		if (req.body.username?.value.length > 20) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Username too long: max 20' };
		}
	}
	else if (req.body.username) {
		if (req.body.username.length < 3) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Username too short: min 3' };
		}
		if (req.body.username.length > 20) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Username too long: max 20' };
		}
	}

	const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
	if (req.body.email?.value && !email_regex.test(req.body.email?.value) && !update) {
		return { success: false, code: 400, source: "/auth:validate_registration", error: 'Invalid email format' };
	}
	else if (req.body.email && !email_regex.test(req.body.email) && !update) {
		return { success: false, code: 400, source: "/auth:validate_registration", error: 'Invalid email format' };
	}

	if (req.body.password?.value) {
		if (req.body.password?.value.length < 8) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too short: min 8' };
		}
		if (req.body.password?.value.length > 64) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too long: max 64' };
		}
		if (req.body.password?.value.includes(req.body.username?.value) || req.body.password?.value.includes(req.body.email?.value.split('@')[0])) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must not contain username or email address' };
		}
		const password_regex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_]).{8,64}$/;
		if (!password_regex.test(req.body.password?.value)) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must contain at least 1 Small letter, 1 Capital letter, 1 Digit and 1 Symbol' };
		}
	}
	else if (req.body.password) {
		if (req.body.password.length < 8) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too short: min 8' };
		}
		if (req.body.password.length > 64) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too long: max 64' };
		}
		if (req.body.password.includes(req.body.username) || req.body.password.includes(req.body.email.split('@')[0])) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must not contain username or email address' };
		}
		const password_regex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_]).{8,64}$/;
		if (!password_regex.test(req.body.password)) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must contain at least 1 Small letter, 1 Capital letter, 1 Digit and 1 Symbol' };
		}
	}

	if (req.body.newpassword?.value) {
		if (req.body.newpassword?.value.length < 8) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too short: min 8' };
		}
		if (req.body.newpassword?.value.length > 64) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too long: max 64' };
		}
		if (req.body.newpassword?.value.includes(req.body.username?.value) || req.body.newpassword?.value.includes(req.body.email?.value.split('@')[0])) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must not contain username or email address' };
		}
		const password_regex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_]).{8,64}$/;
		if (!password_regex.test(req.body.newpassword?.value)) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must contain at least 1 Small letter, 1 Capital letter, 1 Digit and 1 Symbol' };
		}
	}
	else if (req.body.newpassword) {
		if (req.body.newpassword.length < 8) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too short: min 8' };
		}
		if (req.body.newpassword.length > 64) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Password too long: max 64' };
		}
		if (req.body.newpassword.includes(req.body.username) || req.body.newpassword.includes(req.body.email.split('@')[0])) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must not contain username or email address' };
		}
		const password_regex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_]).{8,64}$/;
		if (!password_regex.test(req.body.newpassword)) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Unsafe password: Must contain at least 1 Small letter, 1 Capital letter, 1 Digit and 1 Symbol' };
		}
	}
	if (!req.body.avatarFile || !req.body.avatarFile.file.bytesRead) {
		const url_regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?)$/i;
		if (req.body.avatarURL?.value) {
			if (!url_regex.test(req.body.avatarURL?.value))
				return { success: false, code: 400, source: "/auth:validate_registration", error: 'Invalid image URL' };
		}
		else if (req.body.avatarURL && !url_regex.test(req.body.avatarURL)) {
			return { success: false, code: 400, source: "/auth:validate_registration", error: 'Invalid image URL' };
		}
	}
	return null;
}

export async function save_pfp(url) {
	let avatarURI = "/cdn/avatars/kermit.webp";
	try {
		const res = await fetch(`${ process.env.CDN_URL }/avatars`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { url } )
		});
		if (!res.ok)
			console.error('Failed to fetch avatar: ', await res.text(), ' from CDN');
		else {
			const data = await res.json();
			console.info('Fetched avatar from CDN: ', data);
			avatarURI = data.public_url;
		}
	} catch (err) {
		console.error('Failed to make contact with CDN service: ', err);
	}
	return avatarURI;
}