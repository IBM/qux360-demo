<script lang="ts">
    import type { TranscriptFileI } from "$lib/models";
    import { Button, Checkbox, Search, Stack } from "carbon-components-svelte";
    import { TranscriptCard } from ".";

    export let transcriptFiles: TranscriptFileI[];

    let filteredTranscripts: TranscriptFileI[] = [];
    let searchTranscriptValue: string = "";

    let checkedTranscriptsMap: Record<string, boolean> = {};

    let allSelected: boolean = false;
    let noneSelected: boolean = false;
    let mixedSelection: boolean = false;

    $: filteredTranscripts = transcriptFiles.filter(
        (transcript: TranscriptFileI) =>
            transcript.name
                .toLowerCase()
                .includes(searchTranscriptValue.toLowerCase()),
    );

    $: allSelected =
        filteredTranscripts.length > 0 &&
        filteredTranscripts.every(
            (t: TranscriptFileI) => checkedTranscriptsMap[t.name],
        );

    $: noneSelected =
        filteredTranscripts.length > 0 &&
        filteredTranscripts.every(
            (t: TranscriptFileI) => !checkedTranscriptsMap[t.name],
        );

    $: mixedSelection = !allSelected && !noneSelected;

    const handleUploadTranscriptsButtonClick = (): void => {
        // TODO: Add functionality
    };

    const handleSelectAll = (): void => {
        filteredTranscripts.forEach(
            (t: TranscriptFileI) => (checkedTranscriptsMap[t.name] = true),
        );
    };

    const handleDeselectAll = (): void => {
        filteredTranscripts.forEach(
            (t: TranscriptFileI) => (checkedTranscriptsMap[t.name] = false),
        );
    };

    const updateTranscriptSelection = (name: string, value: boolean): void => {
        checkedTranscriptsMap[name] = value;
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

    <div class="select-buttons">
        {#if mixedSelection}
            <Button
                class="select-button"
                kind="ghost"
                size="small"
                on:click={handleSelectAll}
            >
                Select all
            </Button>

            <Button
                class="deselect-button"
                kind="ghost"
                size="small"
                on:click={handleDeselectAll}
            >
                Deselect all
            </Button>
        {:else if allSelected}
            <Button
                class="deselect-button"
                kind="ghost"
                size="small"
                on:click={handleDeselectAll}
            >
                Deselect all
            </Button>
        {:else}
            <Button
                class="select-button"
                kind="ghost"
                size="small"
                on:click={handleSelectAll}
            >
                Select all
            </Button>
        {/if}
    </div>

    {#if filteredTranscripts.length > 0}
        <Stack gap={5}>
            {#each filteredTranscripts as transcript (transcript.name)}
                <TranscriptCard
                    {transcript}
                    checked={checkedTranscriptsMap[transcript.name]}
                    onCheckChange={(value) =>
                        updateTranscriptSelection(transcript.name, value)}
                />
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

    .select-buttons {
        display: flex;
    }

    :global(.select-button) {
        width: fit-content;
    }
</style>
