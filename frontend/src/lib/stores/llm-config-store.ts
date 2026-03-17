import { writable, type Writable } from "svelte/store";
import { type LLMConfigI } from "$lib/models";

const STORAGE_KEY = "qux360_llm_config";

const createLLMConfigStore = () => {
    let initialConfig: LLMConfigI | null = null;

    if (typeof window !== "undefined") {
        const stored: string | null = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                initialConfig = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse LLM config from localStorage", e);
            }
        }
    }

    const { subscribe, set, update }: Writable<LLMConfigI | null> = writable(initialConfig);

    return {
        subscribe,
        setConfig: (config: LLMConfigI) => {
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            }
            set(config);
        },
        clearConfig: () => {
            if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEY);
            }
            set(null);
        }
    };
}

export const llmConfigStore = createLLMConfigStore();
