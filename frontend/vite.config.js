import { svelte } from "@sveltejs/vite-plugin-svelte";
import { optimizeImports, optimizeCss } from "carbon-preprocess-svelte";
import path from "path";
import { sveltePreprocess } from "svelte-preprocess";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/qux360-demo/",
    plugins: [
        svelte({
            preprocess: [
                sveltePreprocess({
                    scss: {
                        includePaths: ["src"],
                    },
                }),
                optimizeImports(),
            ],
        }),
        optimizeCss(),
    ],
    resolve: {
        alias: {
            $lib: path.resolve(__dirname, "src/lib"),
        },
    },
    build: {
        outDir: "build",
    },
    root: ".",
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
});
