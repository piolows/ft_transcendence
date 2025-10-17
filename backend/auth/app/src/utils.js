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
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

export function validate_registration(user, req) {
	if (user && user['password'] != null) {
		return { code: 403, msg: 'User already exists' };
	}
	if (req.body.username.length < 3) {
		return { code: 400, msg: 'Username too short: min 3' };
	}
	if (req.body.username.length > 20) {
		return { code: 400, msg: 'Username too long: max 20' };
	}

	const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
	if (!email_regex.test(req.body.email)) {
		return { code: 400, msg: 'Invalid email format' };
	}
	if (req.body.password.length < 8) {
		return { code: 400, msg: 'Password too short: min 8' };
	}
	if (req.body.password.length > 64) {
		return { code: 400, msg: 'Password too long: max 64' };
	}
	if (req.body.password.includes(req.body.username) || req.body.password.includes(req.body.email.split('@')[0])) {
		return { code: 400, msg: 'Unsafe password: Must not contain username or email address' };
	}

	const password_regex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_]).{8,64}$/;
	if (!password_regex.test(req.body.password)) {
		return { code: 400, msg: 'Unsafe password: Must contain at least 1 Small letter, 1 Capital letter, 1 Digit and 1 Symbol' };
	}

	const url_regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?)$/i;
	if (req.body.avatarURL && !url_regex.test(req.body.avatarURL)) {
		return { code: 400, msg: 'Invalid email' };
	}
	return null;
}

export async function save_pfp(url) {
	let avatarURI = "/cdn/avatars/kermit.webp";
	try {
		const res = await fetch(`${ process.env.CDN_URL }/cdn/avatars`, {
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