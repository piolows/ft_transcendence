import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import path from "path";
import { promises as fs } from "fs";
import fetch from "node-fetch";
import { randomUUID } from "crypto";

function shortUUID(){
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

// const endpointHandler = (fastify, options, done) => {
//     fastify.post("/avatars/from-url", async (req, reply) => {
//         // Optional: simple internal security check
//         // const token = req.headers["x-internal-token"];
//         // if (process.env.INTERNAL_API_TOKEN && token !== process.env.INTERNAL_API_TOKEN) {
//         //     return reply.code(403).send({ error: "Unauthorized" });
//         // }

//         const { url } = req.body;
//         if (!url) return reply.code(400).send({ error: "Missing URL" });

//         try {
//             const response = await fetch(url);
//             if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

//             const contentType = response.headers.get("content-type") || "";
//             const ext = contentType.includes("jpeg")
//             ? ".jpg"
//             : contentType.includes("png")
//             ? ".png"
//             : contentType.includes("webp")
//             ? ".webp"
//             : contentType.includes("gif")
//             ? ".gif"
//             : "";

//             const filename = `${randomUUID().replace(/-/g, "").slice(0, 16)}${ext}`;
//             const buffer = Buffer.from(await response.arrayBuffer());
//             await fs.writeFile(path.join(`${process.cwd()}/public/uploads/avatars`, filename), buffer);

//             const public_url = `/avatars/${filename}`;
//             return reply.send({ filename, public_url });
//         } catch (err) {
//             fastify.log.error(err);
//             return reply.code(500).send({ error: "Failed to download avatar" });
//         }
//         });

//         done();
// }

// export default endpointHandler;

export default async function endpointHandler(fastify) {
  fastify.post("/api/avatar/from-url", async (req, reply) => {
    const { url } = req.body;
    if (!url) return reply.code(400).send({ error: "Missing URL" });

    try {
      fastify.log.info(`Fetching avatar from ${url}`);

      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
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