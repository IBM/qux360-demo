import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

//console.log(import.meta.env.VITE_BACKEND_URL);


const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:8000";
console.log("Backend URL is:", BACKEND_URL);
 
export default defineConfig({
  plugins: [svelte()],
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

