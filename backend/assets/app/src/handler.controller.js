import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import path from "path";
import { promises as fs } from "fs";
import fetch from "node-fetch";
import { randomUUID } from "crypto";

export default async function endpointHandler(fastify) {
  fastify.post("/api/avatar/from-url", async (req, reply) => {
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

      const public_url = `/avatars/${filename}`;
      fastify.log.info(`Saved avatar as ${public_url}`);

      return reply.send({ filename, public_url });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to download avatar" });
    }
  });
}