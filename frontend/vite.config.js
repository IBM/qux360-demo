import { svelte } from "@sveltejs/vite-plugin-svelte";
import { optimizeImports, optimizeCss } from "carbon-preprocess-svelte";
import path from "path";
import { sveltePreprocess } from "svelte-preprocess";
import { defineConfig } from "vite";

export default defineConfig({
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
    root: ".",
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
});
