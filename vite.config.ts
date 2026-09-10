import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import type { LibraryFormats } from "vite";

export default defineConfig(({ mode }) =>
{
  const isBundler = (mode === "bundler");

  const suffix = isBundler ? "bundler." : "";
  const formats: LibraryFormats[] = isBundler ? ["es"] : ["es", "cjs", "iife"];

  return {
    build: {
      minify: !(isBundler),
      lib: {
        entry: fileURLToPath(new URL("src/index.ts", import.meta.url)),
        fileName: (format) =>
        {
          if (format === "cjs") { return "core.cjs"; }
          if (format === "es") { return `core.esm.${suffix}js`; }
          if (format === "iife") { return "core.global.js"; }

          throw new Error(`Unknown build format: ${format}`);
        },
        formats: formats,
        name: "Core"
      },
      rollupOptions: {
        output: { exports: "named" }
      },
      sourcemap: true,
      emptyOutDir: !(isBundler)
    }
  };
});
