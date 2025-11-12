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
	},
	proxy: {
		'/cdn': {
			target: 'https://localhost:4161',
			changeOrigin: true,
			// rewrite: path => path.replace(/^\/cdn/, '/cdn')
		}
	},
});
