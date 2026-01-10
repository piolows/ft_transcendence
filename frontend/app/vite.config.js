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
			key: fs.readFileSync(path.resolve(__dirname, "certs/localhost-key.pem")),
			cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost-cert.pem")),
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
});
