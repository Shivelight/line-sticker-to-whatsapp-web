import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { execSync } from "child_process";

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

process.env.VITE_GIT_COMMIT_HASH = execSync("git rev-parse --short HEAD")
  .toString()
  .trimEnd();
