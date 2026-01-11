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
		hmr: {
			protocol: 'wss',
		},
		host: "0.0.0.0",
		port: 8443,
		proxy: {
			'/api': {
				target: 'https://backend:4161',
				changeOrigin: true,
				secure: false,
				headers: {
					Connection: 'close',
				},
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
			'/games': {
				target: 'https://backend_games:4116',
				changeOrigin: true,
				secure: false,
				headers: {
					Connection: 'close',
				},
				rewrite: (path) => path.replace(/^\/games/, ''),
			},
			'/streams': {
				target: 'wss://backend_games:4116',
				changeOrigin: true,
				ws: true,
				secure: false,
				headers: {
					Connection: 'close',
				},
				rewrite: (path) => path.replace(/^\/streams/, ''),
			},
		}
	},
});
