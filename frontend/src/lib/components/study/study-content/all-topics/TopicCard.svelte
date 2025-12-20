<script lang="ts">
    import { EditTopicModal, SupportingQuotes } from "$lib/common";
    import type { IdentifiedTopicI, TopicCardI } from "$lib/models";
    import { Button } from "carbon-components-svelte";
    import { ChevronDown, ChevronUp, Edit } from "carbon-icons-svelte";

    export let topicCard: TopicCardI;
    export let openCards: Map<string, boolean>;

    let topicToEdit: IdentifiedTopicI | null = null;

    let isEditTopicModalOpen: boolean = false;

    const handleEditTopicButtonClick = (topic: IdentifiedTopicI): void => {
        topicToEdit = topic;
        isEditTopicModalOpen = true;
    };

    const toggleCard = (id: string): void => {
        openCards = new Map(openCards);
        openCards.set(id, !(openCards.get(id) ?? false));
    };
</script>

<div class="topic-card" class:topic-card-open={topicCard.isOpen}>
    <div class="topic-card-left-side">
        <div class="topic-card-header">
            <span class="topic-name">
                {topicCard.topic.topic}
            </span>
            <Button
                class="topic-card-button"
                kind="ghost"
                size="small"
                on:click={() => {
                    handleEditTopicButtonClick(topicCard.topic);
                }}
            >
                <Edit size={16} />
            </Button>
        </div>

        {#if !topicCard.isOpen}
            <div class="topic-card-subheader">
                <span>
                    {topicCard.topic.quotes.length} supporting quotes
                </span>
                <strong>•</strong>
                <span>
                    {topicCard.transcriptFile.name}
                </span>
            </div>
        {:else}
            <div class="topic-card-internal-container">
                <span class="topic-card-label">Description</span>
                <span class="topic-card-text">
                    {topicCard.topic.explanation}
                </span>
            </div>

            <div class="topic-card-internal-container">
                <SupportingQuotes quotes={topicCard.topic.quotes} />
            </div>

            <div class="topic-card-internal-container">
                <span class="topic-card-label">Source</span>
                <span class="topic-card-text">
                    {topicCard.transcriptFile.name}
                </span>
            </div>
        {/if}
    </div>

    <Button
        class="topic-card-button"
        kind="ghost"
        size="small"
        on:click={() => {
            toggleCard(topicCard.id);
        }}
    >
        {#if topicCard.isOpen}
            <ChevronUp size={16} />
        {:else}
            <ChevronDown size={16} />
        {/if}
    </Button>
</div>

{#key isEditTopicModalOpen}
    {#if isEditTopicModalOpen && topicToEdit}
        <EditTopicModal
            bind:isModalOpen={isEditTopicModalOpen}
            transcriptFileId={topicCard.transcriptFile.id}
            originalTopicName={topicToEdit.topic}
            topicName={topicToEdit.topic}
            topicDescription={topicToEdit.explanation}
            quotes={topicToEdit.quotes}
        />
    {/if}
{/key}

<style lang="scss">
    @use "@carbon/type";

    .topic-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 1.5rem 1rem;
        background-color: var(--cds-ui-background);
        border: 0.5px solid var(--cds-border-interactive);
        border-radius: 0.25rem;
    }

    .topic-card-open {
        align-items: flex-start;
    }

    .topic-card-left-side {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .topic-card-header {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .topic-name {
        @include type.type-style("heading-02");
    }

    .topic-card-subheader {
        @include type.type-style("label-01");
        line-height: 1rem;
    }

    :global(.topic-card-button) {
        min-height: 1rem;
        padding: 7px !important;
    }
</style>
