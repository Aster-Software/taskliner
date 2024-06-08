import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import path from "path";
import { fileURLToPath } from "url";
import solid from "@astrojs/solid-js";
import tsconfigPaths from "vite-tsconfig-paths";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    plugins: [tsconfigPaths({ root: "./" })],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:4000",
        },
      },
    },
    resolve: {
      alias: {
        "@style": path.resolve(__dirname, "./styled-system"),
      },
    },
  },
  integrations: [solid()],
});
