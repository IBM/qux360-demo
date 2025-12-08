<script lang="ts">
    import { type TranscriptFileI, type TranscriptLineI } from "$lib/models";
    import { apiService } from "$lib/services";
    import { selectedTranscriptStore } from "$lib/stores";
    import { Search, SkeletonText } from "carbon-components-svelte";
    import { onMount } from "svelte";
    import { ParticipantIdentification } from ".";

    let searchQuoteOrTopicValue: string = "";

    let isLoadingTranscriptLines: boolean = true;
    let transcriptLines: TranscriptLineI[] = [];

    onMount(() => {
        selectedTranscriptStore.subscribe(
            async (selectedTranscript: TranscriptFileI | null) => {
                if (selectedTranscript && selectedTranscript.id) {
                    transcriptLines = await apiService.getTranscriptLines(
                        selectedTranscript.id,
                    );
                }
                isLoadingTranscriptLines = false;
            },
        );
    });
</script>

<div class="transcript-information-tab-content-container">
    <div class="left-content-container">
        <ParticipantIdentification />

        <h3 class="transcript-section-title">Speaker anonymization</h3>

        <h3 class="transcript-section-title">Entity anonymization</h3>
    </div>
    <div class="right-content-container">
        <div class="right-content-internal-container">
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
    </div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-information-tab-content-container {
        flex: 1;
        display: flex;
        overflow: auto;
    }

    .left-content-container,
    .right-content-container {
        flex: 1;
    }

    .left-content-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding-top: 2rem;
        padding-bottom: 2rem;
        padding-left: 2rem;
        padding-right: 1rem;
    }

    .right-content-container {
        display: flex;
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 1rem;
        padding-right: 2rem;
    }

    .right-content-internal-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem 2rem;
        background-color: var(--cds-background);
        box-shadow: 2px 4px 10px 0px #0000000d;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;
    }

    :global(.transcript-section-title) {
        @include type.type-style("heading-03");
        line-height: 1.75rem;
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
