// app.config.js
import { createApp } from "vinxi";
var app_config_default = createApp({
  server: {
    experimental: {
      asyncContext: true
    }
  },
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/"
    }
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
  ]
});
export {
  app_config_default as default
};