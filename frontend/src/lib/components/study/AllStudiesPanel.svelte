<script lang="ts">
    import {
        TranscriptState,
        type StudyI,
        type TranscriptFileI,
    } from "$lib/models";
    import {
        selectedStudyIdStore,
        selectedTranscriptFileIdStore,
        studiesStore,
    } from "$lib/stores";
    import { Stack, truncate } from "carbon-components-svelte";
    import { ChevronDown, ChevronUp } from "carbon-icons-svelte";

    const handleStudyItemClick = (study: StudyI): void => {
        selectedStudyIdStore.set(study.id);
        selectedTranscriptFileIdStore.set(undefined);
    };

    const handleTranscriptFileItemClick = (
        transcriptFile: TranscriptFileI,
    ): void => {
        selectedTranscriptFileIdStore.set(transcriptFile.id);
    };
</script>

<h4 class="all-studies-header">All studies</h4>
<div class="study-items-container">
    {#each $studiesStore as study (`${study.id}-${$selectedStudyIdStore}`)}
        <div
            class="study-item-container"
            class:study-item-container-selected={study.id ===
                $selectedStudyIdStore}
            on:click={() => {
                handleStudyItemClick(study);
            }}
        >
            <div
                class="study-item-title"
                class:study-item-title-selected={study.id ===
                    $selectedStudyIdStore}
                use:truncate
            >
                {study.name}
            </div>
            <div class="chevron-icon-container">
                {#if study.id === $selectedStudyIdStore}
                    <ChevronUp />
                {:else}
                    <ChevronDown />
                {/if}
            </div>
        </div>
        {#if study.id === $selectedStudyIdStore}
            <Stack gap={3}>
                {#each study.transcriptFiles as transcriptFile (transcriptFile.name)}
                    <div
                        class="transcript-file-item-container"
                        on:click={() => {
                            handleTranscriptFileItemClick(transcriptFile);
                        }}
                    >
                        <span
                            class="transcript-file-name"
                            class:transcript-file-needs-review={transcriptFile
                                .status.state === TranscriptState.Review}
                        >
                            {transcriptFile.name}
                        </span>
                        {#if transcriptFile.status.state === TranscriptState.Review || transcriptFile.status.state === TranscriptState.Finish}
                            <svelte:component
                                this={transcriptFile.status.icon}
                                style="fill: {transcriptFile.status.iconColor};"
                            />
                        {/if}
                    </div>
                {/each}
            </Stack>
        {/if}
    {/each}
</div>

<style lang="scss">
    @use "@carbon/type";

    .all-studies-header {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
        padding-top: 2rem;
        padding-bottom: 1rem;
        padding-left: 2.5rem;
        padding-right: 2.5rem;
    }

    .study-items-container {
        display: flex;
        flex-direction: column;
    }

    .study-item-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.4375rem;
        padding-bottom: 0.4375rem;
        padding-left: 2.5rem;
        padding-right: 1rem;
    }

    .study-item-container:hover,
    .transcript-file-item-container:hover {
        cursor: pointer;
        background-color: var(--cds-hover-light-ui);
        user-select: none;
    }

    .study-item-container-selected {
        background-color: var(--cds-tag-background-blue);
    }

    .study-item-title {
        flex: 1;
        @include type.type-style("body-02");
    }

    .study-item-title-selected {
        font-weight: 700;
    }

    .chevron-icon-container {
        flex-shrink: 0;
        width: 1rem;
        height: 1rem;
    }

    .transcript-file-item-container {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        padding-left: 3.5rem;
        padding-right: 1rem;
    }

    .transcript-file-name {
        @include type.type-style("body-compact-02");
    }

    .transcript-file-needs-review {
        font-weight: 700;
    }
</style>
