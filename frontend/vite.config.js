import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { optimizeImports, optimizeCss } from "carbon-preprocess-svelte";

//console.log(import.meta.env.VITE_BACKEND_URL);


const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:8000";
console.log("Backend URL is:", BACKEND_URL);
 
export default defineConfig({
  plugins: [
    svelte({
      preprocess: [optimizeImports()]
    }),
    optimizeCss()
  ],
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

