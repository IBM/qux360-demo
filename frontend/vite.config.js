import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

