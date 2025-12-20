<script lang="ts">
    import {
        CreateTopicModal,
        EditTopicModal,
        SupportingQuotes,
    } from "$lib/common";
    import { TranscriptStatus, type IdentifiedTopicI } from "$lib/models";
    import {
        selectedTranscriptFileIdStore,
        selectedTranscriptStore,
    } from "$lib/stores";
    import {
        Button,
        Link,
        SkeletonPlaceholder,
        SkeletonText,
    } from "carbon-components-svelte";
    import { Add, Edit } from "carbon-icons-svelte";

    export let identifiedTopics: IdentifiedTopicI[];

    let topicToEdit: IdentifiedTopicI | null = null;

    let isCreateNewTopicModalOpen: boolean = false;
    let isEditTopicModalOpen: boolean = false;

    let isSuggestTopicsRunning: boolean = false;

    $: isSuggestTopicsRunning =
        !$selectedTranscriptStore ||
        $selectedTranscriptStore.status ===
            TranscriptStatus.RunningTopicSuggestion;

    const editTopic = (topic: IdentifiedTopicI): void => {
        topicToEdit = topic;
        isEditTopicModalOpen = true;
    };

    const handleTopicNameLinkClick = (topic: IdentifiedTopicI): void => {
        editTopic(topic);
    };

    const handleEditTopicButtonClick = (topic: IdentifiedTopicI): void => {
        editTopic(topic);
    };

    const handleCreateNewTopicButtonClick = (): void => {
        isCreateNewTopicModalOpen = true;
    };
</script>

{#if identifiedTopics.length > 0}
    <div class="topic-names-external-container">
        <h4 class="topics-label">Approved topics</h4>

        <div class="topic-names-vertical-line-container">
            <div class="vertical-line"></div>
            <div class="topic-names-internal-container">
                {#each identifiedTopics as identifiedTopic, index (index)}
                    <div class="topic-name-container">
                        <div class="horizonal-line"></div>
                        {#if isSuggestTopicsRunning}
                            <SkeletonText
                                class="topic-name-loading"
                                width="12rem"
                            />
                        {:else}
                            <Link
                                class="link"
                                on:click={() => {
                                    handleTopicNameLinkClick(identifiedTopic);
                                }}
                            >
                                {identifiedTopic.topic}
                            </Link>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<Button
    kind="tertiary"
    size="field"
    skeleton={isSuggestTopicsRunning}
    icon={Add}
    on:click={handleCreateNewTopicButtonClick}
>
    Create new topic
</Button>

{#each identifiedTopics as identifiedTopic, index (index)}
    {#if identifiedTopic.validation}
        {#if isSuggestTopicsRunning}
            <SkeletonPlaceholder style="height: 40rem; width: 100%;" />
        {:else}
            <div class="topic-card-container">
                <div class="topic-card-header-container">
                    <div class="topic-card-header-internal-container">
                        <span class="topic-card-title-text">
                            {identifiedTopic.topic}
                        </span>
                    </div>

                    <div class="topic-card-header-internal-container">
                        <Button
                            kind="tertiary"
                            icon={Edit}
                            hideTooltip
                            size="small"
                            on:click={() => {
                                handleEditTopicButtonClick(identifiedTopic);
                            }}
                        ></Button>
                    </div>
                </div>

                <div class="topic-card-internal-container">
                    <span class="topic-card-label">Description</span>
                    <span class="topic-card-text">
                        {identifiedTopic.explanation}
                    </span>
                </div>

                <div class="topic-card-internal-container">
                    <SupportingQuotes quotes={identifiedTopic.quotes} />
                </div>
            </div>
        {/if}
    {/if}
{/each}

{#key isCreateNewTopicModalOpen}
    {#if isCreateNewTopicModalOpen}
        <CreateTopicModal bind:isModalOpen={isCreateNewTopicModalOpen} />
    {/if}
{/key}

{#key isEditTopicModalOpen}
    {#if isEditTopicModalOpen && topicToEdit}
        <EditTopicModal
            bind:isModalOpen={isEditTopicModalOpen}
            transcriptFileId={$selectedTranscriptFileIdStore}
            originalTopicName={topicToEdit.topic}
            topicName={topicToEdit.topic}
            topicDescription={topicToEdit.explanation}
            quotes={topicToEdit.quotes}
        />
    {/if}
{/key}

<style lang="scss">
    .topic-card-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--cds-ui-background);
        border: 0.5px solid var(--cds-border-interactive);
        border-radius: 0.25rem;
    }
</style>
