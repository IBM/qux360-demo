<script lang="ts">
    import { type TranscriptFileI, type TranscriptLineI } from "$lib/models";
    import { apiService } from "$lib/services";
    import { selectedTranscriptStore } from "$lib/stores";
    import { Search, SkeletonText } from "carbon-components-svelte";
    import { onDestroy, onMount } from "svelte";
    import type { Unsubscriber } from "svelte/store";

    let searchQuoteOrTopicValue: string = "";

    let isLoadingTranscriptLines: boolean = true;
    let transcriptLines: TranscriptLineI[] = [];

    let unsubscribeSelectedTranscriptStore: Unsubscriber;

    onMount(() => {
        unsubscribeSelectedTranscriptStore = selectedTranscriptStore.subscribe(
            async (selectedTranscript: TranscriptFileI | null) => {
                isLoadingTranscriptLines = true;

                if (selectedTranscript?.id) {
                    transcriptLines = await apiService.getTranscriptLines(
                        selectedTranscript.id,
                    );
                } else {
                    transcriptLines = [];
                }

                isLoadingTranscriptLines = false;
            },
        );
    });

    onDestroy(() => {
        unsubscribeSelectedTranscriptStore?.();
    });
</script>

<div class="transcript-lines-external-container">
    <h3 class="transcript-section-title">Transcript</h3>
    <Search
        bind:value={searchQuoteOrTopicValue}
        placeholder="Search for a quote or topic"
    />
    <div class="transcript-lines-container">
        {#if isLoadingTranscriptLines}
            {#each Array(3) as _}
                <SkeletonText paragraph />
            {/each}
        {:else}
            {#each transcriptLines as transcriptLine}
                <div class="transcript-line-container">
                    <span class="transcript-line-header-text">
                        <span class="speaker-name">
                            {transcriptLine.speaker}
                        </span>
                        {transcriptLine.timestamp}
                    </span>
                    <p class="transcript-line-text">
                        {transcriptLine.statement}
                    </p>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-lines-external-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem 2rem;
        background-color: var(--cds-background);
        box-shadow: 2px 4px 10px 0px #0000000d;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;
    }

    .transcript-lines-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
        overflow: scroll;
    }

    .transcript-line-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .transcript-line-header-text {
        font-size: 0.875rem;
        font-weight: 300;
        line-height: 1.125rem;
        letter-spacing: 0.16px;
        color: var(--cds-button-secondary);
    }

    .speaker-name {
        font-weight: 700;
    }

    .transcript-line-text {
        @include type.type-style("body-01");
        line-height: 1.25rem;
    }
</style>
