<script lang="ts">
    import { Quote } from "$lib/common";
    import type { QuoteI } from "$lib/models";
    import { selectedStudyIdStore, studiesStore } from "$lib/stores";
    import {
        Button,
        Modal,
        TextArea,
        TextInput,
    } from "carbon-components-svelte";
    import { TrashCan } from "carbon-icons-svelte";

    export let isModalOpen: boolean;
    export let transcriptFileId: number | undefined;
    export let originalTopicName: string;
    export let topicName: string;
    export let topicDescription: string;
    export let quotes: QuoteI[];

    const handleRemoveQuote = (lineNumber: number): void => {
        quotes = quotes.filter(
            (quote: QuoteI) => quote.line_number !== lineNumber,
        );
    };

    const handleCancelButtonClick = (): void => {
        isModalOpen = false;
    };

    const handleSaveButtonClick = (): void => {
        if ($selectedStudyIdStore && transcriptFileId) {
            studiesStore.updateTopic(
                $selectedStudyIdStore,
                transcriptFileId,
                originalTopicName,
                topicName,
                topicDescription,
                quotes,
            );
        }
        isModalOpen = false;
    };
</script>

<Modal
    bind:open={isModalOpen}
    modalHeading="Edit topic"
    secondaryButtonText="Cancel"
    primaryButtonText="Save"
    primaryButtonDisabled={topicName.trim() === "" ||
        topicDescription.trim() === ""}
    on:click:button--secondary={handleCancelButtonClick}
    on:click:button--primary={handleSaveButtonClick}
>
    <div class="edit-topic-modal-content-container">
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
        {#if quotes.length > 0}
            <div class="supporting-quotes-external-container">
                <span class="bx--label">Supporting quotes</span>
                <div class="supporting-quotes-container">
                    {#each quotes as quote (quote.line_number)}
                        <div class="supporting-quote-container">
                            <Quote
                                line_number={quote.line_number}
                                timestamp={quote.timestamp}
                                speaker={quote.speaker}
                                quote={quote.quote}
                            />
                            <Button
                                class="remove-quote-button"
                                kind="ghost"
                                size="small"
                                on:click={() =>
                                    handleRemoveQuote(quote.line_number)}
                            >
                                <TrashCan size={16} />
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</Modal>

<style lang="scss">
    .edit-topic-modal-content-container {
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

    :global(.remove-quote-button) {
        min-height: 1rem;
        padding: 3px !important;
    }
</style>
