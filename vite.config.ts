import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/index.ts", import.meta.url)),
      fileName: (format) =>
      {
        if (format === "cjs") { return "core.cjs"; }
        if (format === "es") { return "core.esm.js"; }
        if (format === "iife") { return "core.global.js"; }
        if (format === "umd") { return "core.umd.cjs"; }

        throw new Error(`Unknown build format: ${format}`);
      },
      formats: ["cjs", "es", "iife", "umd"],
      name: "Core"
    },
    rollupOptions: {
      output: { exports: "named" }
    },
    sourcemap: true
  }
});
