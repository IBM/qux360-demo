<script lang="ts">
    import { ModelProvider, type LLMConfigI } from "$lib/models";
    import { llmConfigStore } from "$lib/stores";
    import {
        Modal,
        TextInput,
        PasswordInput,
        Select,
        SelectItem,
        FormGroup,
    } from "carbon-components-svelte";

    export let isModalOpen: boolean = false;

    let config: LLMConfigI = {
        model_id: "",
        base_url: "",
        provider: ModelProvider.OPENAI,
        api_key: "",
        project_id: "",
    };

    $: if (isModalOpen && $llmConfigStore) {
        config = { ...$llmConfigStore };
    } else if (isModalOpen && !$llmConfigStore) {
        config = {
            model_id: "",
            base_url: "",
            provider: ModelProvider.OPENAI,
            api_key: "",
            project_id: "",
        };
    }

    const handleSave = (): void => {
        if (!config.model_id || !config.base_url || !config.provider) {
            return;
        }
        llmConfigStore.setConfig(config);
        isModalOpen = false;
    };

    const handleClose = (): void => {
        isModalOpen = false;
    };
</script>

<Modal
    bind:open={isModalOpen}
    modalHeading="LLM Configuration"
    primaryButtonText="Save Configuration"
    secondaryButtonText="Cancel"
    on:click:button--primary={handleSave}
    on:click:button--secondary={handleClose}
    primaryButtonDisabled={!config.model_id || !config.base_url}
>
    <p style="margin-bottom: 1.5rem;">
        Configure your LLM provider credentials. These settings are stored
        locally in your browser.
    </p>

    <FormGroup>
        <Select labelText="Model Provider" bind:selected={config.provider}>
            <SelectItem value={ModelProvider.OPENAI} text="OpenAI" />
            <SelectItem value={ModelProvider.OLLAMA} text="Ollama" />
            <SelectItem value={ModelProvider.WATSONX} text="Watsonx.AI" />
        </Select>
    </FormGroup>

    <FormGroup>
        <TextInput
            labelText="Model ID"
            placeholder="e.g., gpt-4o, llama3"
            bind:value={config.model_id}
            required
        />
    </FormGroup>

    <FormGroup>
        <TextInput
            labelText="Base URL"
            placeholder="e.g., https://api.openai.com/v1"
            bind:value={config.base_url}
            required
        />
    </FormGroup>

    <FormGroup>
        <PasswordInput
            labelText="API Key (Optional)"
            placeholder="Enter your API key"
            bind:value={config.api_key}
        />
    </FormGroup>

    {#if config.provider === ModelProvider.WATSONX}
        <FormGroup>
            <TextInput
                labelText="Project ID (WatsonX only)"
                placeholder="Enter your WatsonX project ID"
                bind:value={config.project_id}
            />
        </FormGroup>
    {/if}
</Modal>
