import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: "src/main.js",
      formats: ["iife"],
      name: "PubSearch",
      fileName: () => "pub-search.js",
    },
    outDir: "../assets/js",
    emptyOutDir: false,
  },
});
