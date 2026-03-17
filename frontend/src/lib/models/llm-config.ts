export enum ModelProvider {
    OLLAMA = "ollama",
    OPENAI = "openai",
    WATSONX = "watsonx",
}

export interface LLMConfigI {
    model_id: string;
    base_url: string;
    provider: ModelProvider;
    api_key?: string;
    project_id?: string;
}
