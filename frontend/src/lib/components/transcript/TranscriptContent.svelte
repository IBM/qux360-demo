<script lang="ts">
    import { Tabs, TranscriptContentTabID } from "$lib/common";
    import { type TabI } from "$lib/models";
    import {
        selectedTranscriptFileIdStore,
        selectedTranscriptStore,
    } from "$lib/stores";
    import { Button } from "carbon-components-svelte";
    import { ArrowLeft } from "carbon-icons-svelte";

    const tabs: TabI[] = [
        {
            id: TranscriptContentTabID.TranscriptInformation,
            label: "Transcript information",
        },
        { id: TranscriptContentTabID.Analysis, label: "Analysis" },
    ];

    let activeTab: string = TranscriptContentTabID.TranscriptInformation;

    const handleBackButtonClick = (): void => {
        selectedTranscriptFileIdStore.set(undefined);
    };
</script>

{#if $selectedTranscriptStore}
    <div class="transcript-content-header-external-container">
        <div class="transcript-content-header-internal-container">
            <Button
                class="back-button"
                kind="ghost"
                size="small"
                on:click={handleBackButtonClick}
            >
                <ArrowLeft size={24} />
            </Button>
            <h4 class="transcript-content-header">
                {$selectedTranscriptStore.name}
            </h4>
        </div>
    </div>
    <Tabs {tabs} bind:activeTab />
{/if}

<style lang="scss">
    @use "@carbon/type";

    .transcript-content-header-external-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2rem 1rem 1rem;
    }

    .transcript-content-header-internal-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .transcript-content-header {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
    }
</style>
