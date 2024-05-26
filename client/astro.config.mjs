import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

import solid from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
        }
      }
    }
  },
  integrations: [solid()]
});