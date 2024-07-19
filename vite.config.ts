import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/index.ts", import.meta.url)),
      name: "Core"
    },
    rollupOptions: {
      output: { exports: "named" }
    },
    sourcemap: true
  }
});
