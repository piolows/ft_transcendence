import path from "path";
import { promises as fs } from "fs";
import fetch from "node-fetch";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";

export function extType(contentType) {
	let ext = ".png";
	if (contentType) {
		const mapping = {
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"image/gif": ".gif",
			"image/webp": ".webp",
			"image/bmp": ".bmp",
			"image/svg+xml": ".svg",
		};
		ext = mapping[contentType] || ".png";
	}
	return ext;
}

export default async function endpointHandler(fastify) {
  // if /new is called, create a new folder within the public folder using the body parameter "folder"
	// fastify.post("/new", async (req, reply) => {
	// 	const { folder } = req.body;
	// 	if (!folder)
	// 		return reply.code(400).send({ error: 'Missing folder parameter'});
	// 	const new_dir = path.join(process.cwd(), 'public', folder);
	// 	try {
	// 		await fs.mkdir(new_dir, { recursive: true });
	// 		return reply.send({ message: `Folder ${folder} created successfully` });
	// 	} catch (err) {
	// 		fastify.log.error(err);
	// 		return reply.code(500).send({ error: 'Failed to create folder' });
	// 	}
	// });

	// fastify.get('/avatars/*', async (req, reply) => {
	// 	const avatarFile = req.url.slice('/avatars/'.length);
	// 	const CDN_ROOT = path.join(process.cwd(), 'public');
	// 	const filePath = `/uploads/avatars/${avatarFile}`;
	// 	try {
	// 	// await fs.promises.access(filePath, fs.constants.R_OK); // check file exists
	// 	return reply.sendFile(filePath); // use fastify-static
	// 	} catch (err) {
	// 	fastify.log.error(`Avatar not found: ${filePath}`);
	// 	return reply.code(404).send({ error: 'Avatar not found' });
	// 	}
	// });

	fastify.post('/upload-image', async (req, reply) => {
		try {
			const file = await req.file();
			if (!file)
				return reply.send({ success: false, code: 400, source: "/cdn/upload-image", error: 'No file uploaded' });
			const ext = extType(file.mimetype);
			const filename = `${randomUUID().replace(/-/g, "").slice(0, 16)}${ext}`;
			const avatarDir = path.join(process.cwd(), "public", "uploads", "avatars");
			await pipeline(file.file, fs.createWriteStream(path.join(avatarDir, filename)));

			const public_url = `/cdn/avatars/${filename}`;
			fastify.log.info(`Saved avatar as ${public_url}`);

			return reply.send({ success: true, filename, public_url });
		} catch (error) {
			console.log(error);
			return reply.send({ success: false, code: 500, source: "/cdn/upload-image", error: error.text });
		}
	});

	fastify.post("/delete", async (req, reply) => {
		const { file } = req.body;
		if (!file)
			return reply.send({ success: false, code: 400, source: "/cdn/delete", error: 'Missing file parameter'});
		const new_file = path.join(process.cwd(), 'public', file);
		if (fs.existsSync(new_file)) {
			try {
				fs.unlink(new_file, (err) => {
					if (err) {
						console.error('Error deleting file:', err);
						fastify.log.error(err);
						return reply.send({ success: false, code: 500, source: "/cdn/delete", error: 'Failed to delete file' });
					}
				});
			} catch (err) {
				fastify.log.error(err);
				return reply.send({ success: false, code: 500, source: "/cdn/delete", error: 'Failed to delete file' });
			}
		}
		return reply.send({ success: true });
	});

	fastify.post("/avatars", async (req, reply) => {
		const { url } = req.body;
		if (!url)
			return reply.send({ success: false, code: 400, source: "/cdn/avatars", error: "Missing URL" });
		try {
			fastify.log.info(`Fetching avatar from ${url}`);

			const response = await fetch(url, {
				headers: { "User-Agent": "Mozilla/5.0" },
			});
			if (!response.ok)
				throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);

			const contentType = response.headers.get("content-type") || null;
			const ext = extType(contentType);
			const filename = `${randomUUID().replace(/-/g, "").slice(0, 16)}${ext}`;
			const avatarDir = path.join(process.cwd(), "public", "uploads", "avatars");
			const buffer = Buffer.from(await response.arrayBuffer());
			await fs.writeFile(path.join(avatarDir, filename), buffer);

			const public_url = `/cdn/avatars/${filename}`;
			fastify.log.info(`Saved avatar as ${public_url}`);

			return reply.send({ success: true, filename, public_url });
		} catch (err) {
			fastify.log.error(err);
			return reply.send({ success: false, code: 500, source: "/cdn/avatars", error: "Failed to download avatar" });
		}
	});
}