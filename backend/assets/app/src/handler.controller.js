import { FastifyPluginAsync } from 'fastify';
import { StorageService } from '../services/storage';
import { ImageProcessor } from '../utils/imageProcessor';
import { validateImage } from '../services/validator';

const storageService = new StorageService();
const imageProcessor = new ImageProcessor();

const endpointHandler = (fastify, options, done) => {
    // Upload avatar (called by auth service during registration)
    fastify.post('/upload', async (request, reply) => {
        try {
            const data = await request.file();
            
            if (!data) {
                return reply.code(400).send({ error: 'No file uploaded' });
            }

            // Validate image
            const validation = validateImage(data);
            if (!validation.valid) {
                return reply.code(400).send({ error: validation.error });
            }

            // Get buffer from stream
            const buffer = await data.toBuffer();

            // Process image (resize, optimize)
            const processedImage = await imageProcessor.process(buffer, {
                width: 200,
                height: 200,
                quality: 80,
            });

            // Generate unique filename
            const userId = request.headers['x-user-id'] as string;
            if (!userId) {
                return reply.code(400).send({ error: 'User ID required' });
            }

            const filename = `${userId}-${Date.now()}.webp`;

            // Save to storage
            const filePath = await storageService.save(filename, processedImage);

            // Return URL
            const avatarUrl = `${process.env.ASSET_SERVICE_URL}/assets/${filename}`;

            return reply.code(201).send({
                success: true,
                url: avatarUrl,
                filename,
            });
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to upload avatar' });
        }
    });

    // Download from Google and save (called during registration)
    fastify.post('/from-google', async (request, reply) => {
        try {
            const { googleImageUrl, userId } = request.body as {
                googleImageUrl: string;
                userId: string;
            };

            if (!googleImageUrl || !userId) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            // Fetch from Google
            const response = await fetch(googleImageUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch from Google');
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            // Process and save
            const processedImage = await imageProcessor.process(buffer, {
                width: 200,
                height: 200,
                quality: 80,
            });

            const filename = `${userId}-${Date.now()}.webp`;
            await storageService.save(filename, processedImage);

            const avatarUrl = `${process.env.ASSET_SERVICE_URL}/assets/${filename}`;

            return reply.code(201).send({
                success: true,
                url: avatarUrl,
                filename,
            });
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to download avatar' });
        }
    });

    // Get avatar (proxied through CDN or served directly)
    fastify.get('/:filename', async (request, reply) => {
        const { filename } = request.params as { filename: string };

        try {
            const filePath = await storageService.get(filename);
            if (!filePath) {
                return reply.code(404).send({ error: 'Avatar not found' });
            }

            // Set caching headers
            reply.header('Cache-Control', 'public, max-age=31536000, immutable');
            
            return reply.sendFile(filename);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to retrieve avatar' });
        }
    });

    // Delete avatar (for cleanup)
    fastify.delete('/:filename', async (request, reply) => {
        const { filename } = request.params as { filename: string };
        const userId = request.headers['x-user-id'] as string;

        // Verify ownership (filename should start with userId)
        if (!filename.startsWith(userId)) {
            return reply.code(403).send({ error: 'Unauthorized' });
        }

        try {
            await storageService.delete(filename);
            return reply.code(200).send({ success: true });
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to delete avatar' });
        }
    });
};