<script lang="ts">
    import { Quote } from "$lib/common";
    import {
        ValidationStatus,
        type QuoteI,
        type TranscriptLineI,
    } from "$lib/models";
    import { apiService } from "$lib/services";
    import {
        selectedStudyIdStore,
        selectedTranscriptFileIdStore,
        studiesStore,
    } from "$lib/stores";
    import {
        Checkbox,
        Modal,
        TextArea,
        TextInput,
    } from "carbon-components-svelte";
    import { onMount } from "svelte";

    export let isModalOpen: boolean;

    let topicName: string = "";
    let topicDescription: string = "";

    let transcriptLines: TranscriptLineI[] = [];
    let selectedQuoteIndexes: Set<number> = new Set();

    onMount(async () => {
        if ($selectedTranscriptFileIdStore) {
            transcriptLines = await apiService.getTranscriptLines(
                $selectedTranscriptFileIdStore,
            );
        }
    });

    const onCheckboxChange = (index: number) => {
        if (selectedQuoteIndexes.has(index)) {
            selectedQuoteIndexes.delete(index);
        } else {
            selectedQuoteIndexes.add(index);
        }

        selectedQuoteIndexes = new Set(selectedQuoteIndexes);
    };

    const handleCancelButtonClick = (): void => {
        isModalOpen = false;
        selectedQuoteIndexes.clear();
    };

    const handleCreateButtonClick = (): void => {
        if (!$selectedStudyIdStore || !$selectedTranscriptFileIdStore) return;

        const selectedQuotes: QuoteI[] = transcriptLines
            .filter((line: TranscriptLineI) =>
                selectedQuoteIndexes.has(line.index),
            )
            .map((line: TranscriptLineI) => ({
                index: line.index,
                timestamp: line.timestamp,
                speaker: line.speaker,
                quote: line.statement,
            }));

        studiesStore.addTopic(
            $selectedStudyIdStore,
            $selectedTranscriptFileIdStore,
            {
                topic: topicName,
                explanation: topicDescription,
                quotes: selectedQuotes,
                validation: {
                    status: ValidationStatus.Ok,
                    explanation: "",
                    errors: [],
                    method: null,
                    metadata: null,
                    checks: [],
                    informational: false,
                    isApprovedByUser: true,
                },
            },
        );

        isModalOpen = false;
        selectedQuoteIndexes.clear();
        topicName = "";
        topicDescription = "";
    };
</script>

<Modal
    bind:open={isModalOpen}
    modalHeading="Create topic"
    secondaryButtonText="Cancel"
    primaryButtonText="Create"
    primaryButtonDisabled={topicName.trim() === "" ||
        topicDescription.trim() === ""}
    on:click:button--secondary={handleCancelButtonClick}
    on:click:button--primary={handleCreateButtonClick}
>
    <div class="create-topic-modal-content-container">
        <TextInput
            bind:value={topicName}
            labelText="Topic name"
            placeholder=""
        />
        <TextArea
            bind:value={topicDescription}
            labelText="Topic description"
            placeholder=""
        />

        {#if transcriptLines.length > 0}
            <div class="supporting-quotes-external-container">
                <span class="bx--label">Supporting quotes</span>
                <div class="supporting-quotes-container">
                    {#each transcriptLines as quote (quote.index)}
                        <div class="supporting-quote-container">
                            <div class="checkbox-container">
                                <Checkbox
                                    checked={selectedQuoteIndexes.has(
                                        quote.index,
                                    )}
                                    on:change={() => {
                                        onCheckboxChange(quote.index);
                                    }}
                                />
                            </div>
                            <Quote
                                index={quote.index}
                                timestamp={quote.timestamp}
                                speaker={quote.speaker}
                                quote={quote.statement}
                            />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</Modal>

<style lang="scss">
    .create-topic-modal-content-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .supporting-quotes-external-container {
        display: flex;
        flex-direction: column;
    }

    .supporting-quotes-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .supporting-quote-container {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem 0.75rem;
        background-color: var(--cds-ui-background);
        border: 0.5px solid var(--cds-border-subtle-selected);
    }
</style>
