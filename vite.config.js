import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const viteServerConfig = {
  name: "cors-sharredarraybuffer",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      next();
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), viteServerConfig],
});
