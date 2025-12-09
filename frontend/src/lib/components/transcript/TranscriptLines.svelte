<script lang="ts">
    import {
        type EntityAnonymizationMap,
        type SpeakerAnonymizationMap,
        type TranscriptFileI,
        type TranscriptLineI,
    } from "$lib/models";
    import { apiService } from "$lib/services";
    import { selectedTranscriptStore } from "$lib/stores";
    import { Search, SkeletonText } from "carbon-components-svelte";
    import { onDestroy, onMount } from "svelte";
    import type { Unsubscriber } from "svelte/store";

    let searchQuoteOrTopicValue: string = "";

    let isLoadingTranscriptLines: boolean = true;
    let transcriptLines: TranscriptLineI[] = [];
    let filteredTranscriptLines: TranscriptLineI[] = [];

    let unsubscribeSelectedTranscriptStore: Unsubscriber;

    $: filteredTranscriptLines = transcriptLines.filter(
        (line: TranscriptLineI) => {
            if (!searchQuoteOrTopicValue.trim()) return true;
            return line.statement
                .toLowerCase()
                .includes(searchQuoteOrTopicValue.toLowerCase());
        },
    );

    onMount(() => {
        unsubscribeSelectedTranscriptStore = selectedTranscriptStore.subscribe(
            async (selectedTranscript: TranscriptFileI | null) => {
                isLoadingTranscriptLines = true;

                if (selectedTranscript?.id) {
                    let lines: TranscriptLineI[] =
                        await apiService.getTranscriptLines(
                            selectedTranscript.id,
                        );
                    lines = applySpeakerAnonymization(
                        lines,
                        selectedTranscript.speaker_anonymization_map,
                    );
                    lines = applyEntityAnonymization(
                        lines,
                        selectedTranscript.entity_anonymization_map,
                    );
                    transcriptLines = lines;
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

    const applySpeakerAnonymization = (
        lines: TranscriptLineI[],
        map: SpeakerAnonymizationMap | null,
    ): TranscriptLineI[] => {
        if (!map) return lines;

        return lines.map((line: TranscriptLineI) => ({
            ...line,
            speaker: map[line.speaker] || line.speaker,
        }));
    };

    const applyEntityAnonymization = (
        lines: TranscriptLineI[],
        map: EntityAnonymizationMap,
    ): TranscriptLineI[] => {
        const entityNames = Object.keys(map);
        if (entityNames.length === 0) return lines;

        const escapedNames: string[] = entityNames.map((name: string) =>
            name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        );

        const regex: RegExp = new RegExp(
            `\\b(${escapedNames.join("|")})\\b`,
            "g",
        );

        return lines.map((line: TranscriptLineI) => ({
            ...line,
            statement: line.statement.replace(
                regex,
                (matched) => map[matched] || matched,
            ),
        }));
    };

    const highlightSearch = (text: string): string => {
        if (!searchQuoteOrTopicValue.trim()) return text;

        const escaped: string = searchQuoteOrTopicValue.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        const regex: RegExp = new RegExp(`(${escaped})`, "gi");

        return text.replace(regex, "<mark>$1</mark>");
    };
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
            {#each filteredTranscriptLines as transcriptLine}
                <div class="transcript-line-container">
                    <span class="transcript-line-header-text">
                        <span class="speaker-name">
                            {transcriptLine.speaker}
                        </span>
                        {transcriptLine.timestamp}
                    </span>
                    <p class="transcript-line-text">
                        {@html highlightSearch(transcriptLine.statement)}
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
