import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

export default defineConfig({
	root: "src",
	plugins: [
		tailwindcss()
	],
	server: {
		https: {
			key: fs.readFileSync("/etc/nginx/certs/localhost-key.pem"),
			cert: fs.readFileSync("/etc/nginx/certs/localhost-cert.pem"),
		},
		host: "0.0.0.0",
		port: 443,
		proxy: {
			// Proxy API requests to backend controller
			'/api': {
				target: 'http://backend:4161',
				changeOrigin: true,
				secure: false, // Allow self-signed certificates
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
			// Proxy WebSocket and game HTTP requests to games service
			'/game': {
				target: 'http://backend_games:4116',
				changeOrigin: true,
				secure: false,
				ws: true, // Enable WebSocket proxying
				rewrite: (path) => path.replace(/^\/game/, ''),
			},
			// Proxy CDN requests to backend controller (which proxies to CDN service)
			'/cdn': {
				target: 'http://backend:4161',
				changeOrigin: true,
				secure: false,
			}
		},
	},
	build: {
		outDir: path.resolve(__dirname, 'dist'),
		emptyOutDir: true,
		// Don't fail build on TypeScript errors (handled by tsconfig.json)
		rollupOptions: {
			onwarn(warning, warn) {
				// Suppress TypeScript warnings during build
				if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
				warn(warning);
			}
		}
	},
});
