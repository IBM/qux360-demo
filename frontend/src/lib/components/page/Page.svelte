<script lang="ts">
    import { Header, LLMConfigModal, Notifications } from "$lib/components";
    import { llmConfigStore } from "$lib/stores";
    import { Content } from "carbon-components-svelte";
    import { onMount } from "svelte";

    let isConfigModalOpen: boolean = false;

    onMount(() => {
        if (!$llmConfigStore) {
            isConfigModalOpen = true;
        }
    });

    const handleOpenSettings = (): void => {
        isConfigModalOpen = true;
    };
</script>

<div class="page-container">
    <Header on:open-settings={handleOpenSettings} />
    <div class="page-content">
        <Notifications />
        <Content class="main-content-container">
            <slot name="main-content"></slot>
        </Content>
    </div>
</div>

<LLMConfigModal bind:isModalOpen={isConfigModalOpen} />

<style lang="scss">
    $header-height: 3rem;

    .page-container {
        display: flex;
        width: 100%;
        min-height: 100vh;
        margin: 0;
    }

    .page-content {
        display: flex;
        position: relative;
        top: $header-height;
        height: calc(100vh - $header-height);
        width: 100%;
        margin: 0;
        overflow-y: scroll;
    }

    :global(.main-content-container) {
        display: flex;
        flex-direction: column;
        flex: 1;
        position: relative;
        width: 100%;
        padding: 0;
    }
</style>
