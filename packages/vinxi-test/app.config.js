// import { serverFunctions } from "@vinxi/server-functions/plugin";
import solid from "vite-plugin-solid";
import { createApp } from "vinxi";

export default createApp({
	server: {
		experimental: {
			asyncContext: true,
		},
	},
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			type: "client",
			handler: "./client/app.tsx",
			target: "browser",
			plugins: () => [solid()],
			// base: "/_build",
			base: "/"
		},
		// {
		// 	name: "ssr",
		// 	type: "http",
		// 	base: "/",
		// 	handler: "./app/server.tsx",
		// 	target: "server",
		// 	plugins: () => [solid({ ssr: true })],
		// 	link: {
		// 		client: "client",
		// 	},
		// },
		// {
		// 	name: "client",
		// 	type: "client",
		// 	handler: "./app/client.tsx",
		// 	target: "browser",
		// 	plugins: () => [serverFunctions.client(), solid({ ssr: true })],
		// 	base: "/_build",
		// },
		// serverFunctions.router(),
	],
});
