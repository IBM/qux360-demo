<script lang="ts">
    import {
        READY_TO_IDENTIFY_PARTICIPANTS_TRANSCRIPT_STATUS,
        UploadTranscriptFiles,
    } from "$lib/common";
    import {
        TranscriptState,
        UploadedTranscriptFileStatus,
        type TranscriptFileI,
        type UploadedTranscriptFileI,
        type UploadTranscriptFileResultI,
        type UploadTranscriptFileSuccessI,
    } from "$lib/models";
    import { apiService, utilsService } from "$lib/services";
    import { selectedStudyIdStore, studiesStore } from "$lib/stores";
    import {
        Button,
        Checkbox,
        Modal,
        Search,
        Stack,
    } from "carbon-components-svelte";
    import { onMount } from "svelte";
    import { TranscriptCard } from ".";

    export let transcriptFiles: TranscriptFileI[];

    let filteredTranscripts: TranscriptFileI[] = [];
    let searchTranscriptValue: string = "";

    let filterNeedsReview: boolean = false;
    let filterReady: boolean = false;

    let checkedTranscriptsMap: Record<string, boolean> = {};

    let allSelected: boolean = false;
    let noneSelected: boolean = false;
    let mixedSelection: boolean = false;

    let isUploadTranscriptsModalOpen: boolean = false;

    let uploadedTranscriptFiles: UploadedTranscriptFileI[] = [];

    let hasValidFiles: boolean = false;

    $: hasValidFiles = uploadedTranscriptFiles.some(
        (uploadedTranscriptFile) =>
            uploadedTranscriptFile.status ===
            UploadedTranscriptFileStatus.Success,
    );

    $: filteredTranscripts = transcriptFiles.filter(
        (transcript: TranscriptFileI) => {
            const matchesSearch: boolean = transcript.name
                .toLowerCase()
                .includes(searchTranscriptValue.toLowerCase());

            const matchesFilter: boolean =
                (!filterNeedsReview && !filterReady) ||
                (filterNeedsReview &&
                    transcript.status.state === TranscriptState.Review) ||
                (filterReady &&
                    transcript.status.state === TranscriptState.Ready);
            return matchesSearch && matchesFilter;
        },
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

    onMount(() => {
        uploadedTranscriptFiles = transcriptFiles.map(
            (transcriptFile: TranscriptFileI) => {
                return {
                    id: utilsService.getUniqueId(),
                    file: transcriptFile.file,
                    status: UploadedTranscriptFileStatus.Success,
                };
            },
        );
    });

    const handleUploadTranscriptsButtonClick = (): void => {
        isUploadTranscriptsModalOpen = true;
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

    const handleCancelModalButtonClick = (): void => {
        isUploadTranscriptsModalOpen = false;
    };

    const handleUpdateModalButtonClick = async (): Promise<void> => {
        const newFiles: UploadedTranscriptFileI[] =
            uploadedTranscriptFiles.filter(
                (u: UploadedTranscriptFileI) =>
                    u.status === UploadedTranscriptFileStatus.Success &&
                    !transcriptFiles.some((t) => t.file.name === u.file.name),
            );

        const removedFiles: TranscriptFileI[] = transcriptFiles.filter(
            (t: TranscriptFileI) =>
                !uploadedTranscriptFiles.some(
                    (u: UploadedTranscriptFileI) => u.file.name === t.file.name,
                ),
        );

        const existingFiles: TranscriptFileI[] = transcriptFiles.filter(
            (t: TranscriptFileI) => {
                return !removedFiles.some((r: TranscriptFileI) => {
                    if (t.id && r.id) {
                        return t.id === r.id;
                    }

                    return t.name === r.name;
                });
            },
        );

        let uploadedResults: UploadTranscriptFileResultI;
        if (newFiles.length > 0) {
            uploadedResults = await apiService.uploadFiles(
                newFiles.map((u: UploadedTranscriptFileI) =>
                    utilsService.getTranscriptFile(u.file),
                ),
            );
        } else {
            uploadedResults = { successes: [], errors: [] };
        }

        const newTranscriptFiles: TranscriptFileI[] =
            uploadedResults.successes.map((s: UploadTranscriptFileSuccessI) => {
                const original: UploadedTranscriptFileI = newFiles.find(
                    (u: UploadedTranscriptFileI) => u.file.name === s.filename,
                )!;
                return {
                    id: s.fileId,
                    name: s.filename,
                    file: original.file,
                    size: original.file.size,
                    type: original.file.type,
                    status: READY_TO_IDENTIFY_PARTICIPANTS_TRANSCRIPT_STATUS,
                    speakers: [],
                    participant: {
                        name: "",
                        explanation: "",
                        showExplanation: false,
                        validation: null,
                    },
                    speaker_anonymization_map: null,
                    entity_anonymization_map: {},
                };
            });

        const updatedTranscriptFiles: TranscriptFileI[] = [
            ...existingFiles,
            ...newTranscriptFiles,
        ];
        if ($selectedStudyIdStore) {
            studiesStore.updateTranscriptFiles(
                $selectedStudyIdStore,
                updatedTranscriptFiles,
            );
        }

        isUploadTranscriptsModalOpen = false;
    };
</script>

<div class="transcripts-tab-content-container">
    <div class="action-bar">
        <Stack gap={5} orientation="horizontal">
            <Search
                class="search-fixed-width"
                bind:value={searchTranscriptValue}
                placeholder="Search for a transcript"
            />
            <div class="review-required-checkbox-external-container">
                <span class="bx--label">Filter</span>
                <div class="review-required-checkbox-internal-container">
                    <Checkbox
                        class="checkbox"
                        labelText="Needs review"
                        bind:checked={filterNeedsReview}
                    />
                    <Checkbox
                        class="checkbox"
                        labelText="Ready"
                        bind:checked={filterReady}
                    />
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

<Modal
    bind:open={isUploadTranscriptsModalOpen}
    modalHeading="Update study"
    secondaryButtonText="Cancel"
    primaryButtonText="Update"
    on:click:button--secondary={handleCancelModalButtonClick}
    on:click:button--primary={async () => {
        await handleUpdateModalButtonClick();
    }}
>
    <UploadTranscriptFiles bind:uploadedTranscriptFiles />
</Modal>

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
