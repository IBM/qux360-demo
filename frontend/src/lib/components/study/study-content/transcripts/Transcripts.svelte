<script lang="ts">
    import {
        AILabel,
        TRANSCRIPT_STATUS_MAP,
        UploadTranscriptFiles,
    } from "$lib/common";
    import {
        TranscriptState,
        TranscriptStatus,
        UploadedTranscriptFileStatus,
        type TranscriptFileI,
        type UploadedTranscriptFileI,
        type UploadTranscriptFilesResultI,
        type UploadTranscriptFileSuccessI,
    } from "$lib/models";
    import { apiService, utilsService } from "$lib/services";
    import {
        isRunningAnonymizationStore,
        isRunningTopicsSuggestionStore,
        selectedStudyIdStore,
        selectedStudyStore,
        studiesStore,
    } from "$lib/stores";
    import {
        Button,
        Checkbox,
        Modal,
        Search,
        Stack,
    } from "carbon-components-svelte";
    import { onMount, tick } from "svelte";
    import { TranscriptCard } from ".";

    export let transcriptFiles: TranscriptFileI[];

    let anonymizeButtonContentElementRef: HTMLElement;
    let suggestTopicsButtonContentElementRef: HTMLElement;
    let aiLabelSlugColor: string = "var(--cds-button-tertiary)";

    let filteredTranscripts: TranscriptFileI[] = [];
    let searchTranscriptValue: string = "";

    let filterNeedsReview: boolean = false;
    let filterReady: boolean = false;

    let checkedTranscriptsMap: Record<string, boolean> = {};

    let allSelected: boolean = false;
    let noneSelected: boolean = false;
    let mixedSelection: boolean = false;

    let isRunningAction: boolean = false;

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
                    TRANSCRIPT_STATUS_MAP[transcript.status].state ===
                        TranscriptState.Review) ||
                (filterReady &&
                    TRANSCRIPT_STATUS_MAP[transcript.status].state ===
                        TranscriptState.Ready);
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

    $: if (mixedSelection || allSelected) {
        updateAILabelSlugColors();
    }

    $: if (!isRunningAction) {
        aiLabelSlugColor = "var(--cds-button-tertiary)";
        updateAILabelSlugColors();
    }

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

    const updateAILabelSlugColors = async (): Promise<void> => {
        await tick();

        await utilsService.updateAILabelSlugColor(
            anonymizeButtonContentElementRef,
            aiLabelSlugColor,
        );

        await utilsService.updateAILabelSlugColor(
            suggestTopicsButtonContentElementRef,
            aiLabelSlugColor,
        );
    };

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

    const runSelectedTranscriptsAnonymization = async (): Promise<void> => {
        isRunningAction = true;
        isRunningAnonymizationStore.set(true);
        if (!$selectedStudyStore) {
            isRunningAction = false;
            isRunningAnonymizationStore.set(false);
            return;
        }

        const selectedFilteredTranscripts: TranscriptFileI[] =
            filteredTranscripts.filter(
                (t: TranscriptFileI) => checkedTranscriptsMap[t.name],
            );

        const anonymizationPromises: Promise<void>[] =
            selectedFilteredTranscripts.map((transcript: TranscriptFileI) =>
                studiesStore.runTranscriptSpeakerAndEntityAnonymization(
                    $selectedStudyStore,
                    transcript.id!,
                ),
            );
        await Promise.all(anonymizationPromises);

        isRunningAction = false;
        isRunningAnonymizationStore.set(false);
    };

    const runSelectedTranscriptsTopicsSuggestion = async (): Promise<void> => {
        isRunningAction = true;
        isRunningTopicsSuggestionStore.set(true);
        if (!$selectedStudyIdStore) {
            isRunningAction = false;
            isRunningTopicsSuggestionStore.set(false);
            return;
        }

        const selectedFilteredTranscripts: TranscriptFileI[] =
            filteredTranscripts.filter(
                (t: TranscriptFileI) => checkedTranscriptsMap[t.name],
            );

        const suggestionPromises: Promise<void>[] =
            selectedFilteredTranscripts.map((transcript: TranscriptFileI) =>
                studiesStore.runSuggestTopics(
                    $selectedStudyIdStore,
                    transcript!,
                ),
            );
        await Promise.all(suggestionPromises);

        isRunningAction = false;
        isRunningTopicsSuggestionStore.set(false);
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

        let uploadedResults: UploadTranscriptFilesResultI;
        if (newFiles.length > 0 && $selectedStudyStore) {
            uploadedResults = await apiService.uploadStudyFiles(
                $selectedStudyStore.name,
                [
                    ...existingFiles,
                    ...newFiles.map((u: UploadedTranscriptFileI) =>
                        utilsService.getTranscriptFile(u.file),
                    ),
                ],
            );
        } else {
            uploadedResults = { study_id: "", successes: [], errors: [] };
        }

        const newTranscriptFiles: TranscriptFileI[] =
            uploadedResults.successes.reduce(
                (acc: TranscriptFileI[], s: UploadTranscriptFileSuccessI) => {
                    const original: UploadedTranscriptFileI | undefined =
                        newFiles.find(
                            (u: UploadedTranscriptFileI) =>
                                u.file.name === s.filename,
                        );

                    if (!original) {
                        return acc;
                    }

                    acc.push({
                        id: s.fileId,
                        name: s.filename,
                        file: original.file,
                        size: original.file.size,
                        type: original.file.type,
                        status: TranscriptStatus.ReadyToIdentifyParticipants,
                        speakers: [],
                        participant: {
                            name: "",
                            explanation: "",
                            showExplanation: false,
                            validation: null,
                        },
                        speaker_anonymization_map: null,
                        entity_anonymization_map: {},
                        topics: [],
                    });

                    return acc;
                },
                [] as TranscriptFileI[],
            );

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
        <div class="buttons-container">
            {#if (mixedSelection || allSelected) && filteredTranscripts.length > 0}
                <Button
                    kind="tertiary"
                    size="field"
                    skeleton={isRunningAction}
                    on:click={runSelectedTranscriptsAnonymization}
                    on:mouseenter={async () => {
                        aiLabelSlugColor = "white";
                        await utilsService.updateAILabelSlugColor(
                            anonymizeButtonContentElementRef,
                            aiLabelSlugColor,
                        );
                    }}
                    on:mouseleave={async () => {
                        aiLabelSlugColor = "var(--cds-button-tertiary)";
                        await utilsService.updateAILabelSlugColor(
                            anonymizeButtonContentElementRef,
                            aiLabelSlugColor,
                        );
                    }}
                >
                    <div
                        bind:this={anonymizeButtonContentElementRef}
                        class="button-with-ai-label-container"
                    >
                        Anonymize
                        <AILabel
                            headerText="Anonymize"
                            bodyText="AI is used to identify sensitive entities to anonymize, such as names, locations, and organizations."
                            modelName="granite.13b.v2.instruct"
                            modelLink=""
                            alignment="bottom-right"
                            kind="inline"
                        />
                    </div>
                </Button>
                <Button
                    kind="tertiary"
                    size="field"
                    skeleton={isRunningAction}
                    on:click={runSelectedTranscriptsTopicsSuggestion}
                    on:mouseenter={async () => {
                        aiLabelSlugColor = "white";
                        await utilsService.updateAILabelSlugColor(
                            suggestTopicsButtonContentElementRef,
                            aiLabelSlugColor,
                        );
                    }}
                    on:mouseleave={async () => {
                        aiLabelSlugColor = "var(--cds-button-tertiary)";
                        await utilsService.updateAILabelSlugColor(
                            suggestTopicsButtonContentElementRef,
                            aiLabelSlugColor,
                        );
                    }}
                >
                    <div
                        bind:this={suggestTopicsButtonContentElementRef}
                        class="button-with-ai-label-container"
                    >
                        Suggest topics
                        <AILabel
                            headerText="Suggest topics"
                            bodyText="AI is used to identify major topics in the transcript and provide supporting quotes. Major topics are determined based on the study description you provided."
                            modelName="granite.13b.v2.instruct"
                            modelLink=""
                            alignment="bottom-right"
                            kind="inline"
                        />
                    </div>
                </Button>
            {/if}

            <Button
                kind="primary"
                on:click={handleUploadTranscriptsButtonClick}
            >
                Upload transcripts
            </Button>
        </div>
    </div>

    {#if filteredTranscripts.length > 0}
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
    {/if}

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
