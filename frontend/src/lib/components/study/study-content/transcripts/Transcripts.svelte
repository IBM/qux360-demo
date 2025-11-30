<script lang="ts">
    import type { SerializableTranscriptFileI } from "$lib/models";
    import { Button, Checkbox, Search, Stack } from "carbon-components-svelte";
    import { TranscriptCard } from ".";

    export let transcriptFiles: SerializableTranscriptFileI[];

    let filteredTranscripts: SerializableTranscriptFileI[] = [];
    let searchTranscriptValue: string = "";

    $: filteredTranscripts = transcriptFiles.filter(
        (transcript: SerializableTranscriptFileI) =>
            transcript.name
                .toLowerCase()
                .includes(searchTranscriptValue.toLowerCase()),
    );

    const handleUploadTranscriptsButtonClick = (): void => {
        // TODO: Add functionality
    };
</script>

<div class="transcripts-tab-content-container">
    <div class="action-bar">
        <Stack gap={5} orientation="horizontal">
            <Search
                bind:value={searchTranscriptValue}
                placeholder="Search for a transcript"
            />
            <div class="review-required-checkbox-external-container">
                <span class="bx--label">Filter</span>
                <div class="review-required-checkbox-internal-container">
                    <Checkbox class="checkbox" labelText="Needs review" />
                    <Checkbox class="checkbox" labelText="Ready" />
                </div>
            </div>
        </Stack>
        <Button kind="primary" on:click={handleUploadTranscriptsButtonClick}>
            Upload transcripts
        </Button>
    </div>
    <Button class="select-all-button" kind="ghost" size="small">
        Select all
    </Button>

    {#if filteredTranscripts.length > 0}
        <Stack gap={5}>
            {#each filteredTranscripts as transcript (transcript.name)}
                <TranscriptCard {transcript} />
            {/each}
        </Stack>
    {/if}
</div>

<style lang="scss">
    .transcripts-tab-content-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
    }

    .action-bar {
        display: flex;
        justify-content: space-between;
    }

    .review-required-checkbox-external-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .review-required-checkbox-internal-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    :global(.select-all-button) {
        width: fit-content;
    }
</style>
