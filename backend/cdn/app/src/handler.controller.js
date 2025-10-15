import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import path from "path";
import { promises as fs } from "fs";
import fetch from "node-fetch";
import { randomUUID } from "crypto";
import { emitWarning } from "process";

export default async function endpointHandler(fastify) {
  // if /cdn/new is called, create a new folder within the public folder using the body parameter "folder"
  fastify.post("/new", async (req, reply) => {
      const { folder } = req.body;
      if (!folder) return reply.code(400).send({ error: 'Missing folder parameter'});
      const new_dir = path.join(process.cwd(), 'public', folder);
      try {
        await fs.mkdir(new_dir, { recursive: true });
        return reply.send({ message: `Folder ${folder} created successfully` });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to create folder' });
      }
  });

  fastify.get('/avatars/*', async (req, reply) => {
    const avatarFile = req.url.slice('/avatars/'.length);
    const CDN_ROOT = path.join(process.cwd(), 'public');
    const filePath = `/uploads/avatars/${avatarFile}`;
    try {
      // await fs.promises.access(filePath, fs.constants.R_OK); // check file exists
      return reply.sendFile(filePath); // use fastify-static
    } catch (err) {
      fastify.log.error(`Avatar not found: ${filePath}`);
      return reply.code(404).send({ error: 'Avatar not found' });
    }
  });

  fastify.post("/avatars", async (req, reply) => {
    const { url } = req.body;
    if (!url) return reply.code(400).send({ error: "Missing URL" });

    try {
      fastify.log.info(`Fetching avatar from ${url}`);

      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      fastify.log.info(`Response status: ${response}`);
      if (!response.ok)
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);

      const contentType = response.headers.get("content-type") || "";
      const ext = contentType.includes("jpeg")
        ? ".jpg"
        : contentType.includes("png")
        ? ".png"
        : contentType.includes("webp")
        ? ".webp"
        : contentType.includes("gif")
        ? ".gif"
        : ".jpg";

      const filename = `${randomUUID().replace(/-/g, "").slice(0, 16)}${ext}`;
      const avatarDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(avatarDir, { recursive: true });
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(path.join(avatarDir, filename), buffer);

      const public_url = `/cdn/avatars/${filename}`;
      fastify.log.info(`Saved avatar as ${public_url}`);

      return reply.send({ filename, public_url });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to download avatar" });
    }
  });
}