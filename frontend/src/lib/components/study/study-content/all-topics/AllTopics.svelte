<script lang="ts">
    import { Quote } from "$lib/common";
    import type { IdentifiedTopicI, TranscriptFileI } from "$lib/models";
    import { Button, Search } from "carbon-components-svelte";
    import { Add, ChevronDown, ChevronUp, Edit } from "carbon-icons-svelte";

    export let transcriptFiles: TranscriptFileI[];

    interface IdentifiedTopicWithTranscriptI {
        topic: IdentifiedTopicI;
        transcriptFile: TranscriptFileI;
    }

    interface TopicCardI {
        id: string;
        topic: IdentifiedTopicI;
        transcriptFile: TranscriptFileI;
        isOpen: boolean;
    }

    let filteredIdentifiedTopics: IdentifiedTopicWithTranscriptI[] = [];
    let topicCards: TopicCardI[] = [];
    let openCards: Map<string, boolean> = new Map<string, boolean>();
    let searchTopicValue: string = "";

    $: filteredIdentifiedTopics = transcriptFiles.reduce<
        IdentifiedTopicWithTranscriptI[]
    >((acc, transcriptFile) => {
        const matchingTopics = transcriptFile.topics
            .filter((identifiedTopic: IdentifiedTopicI) => {
                if (!identifiedTopic.validation?.isApprovedByUser) {
                    return false;
                }

                if (!searchTopicValue.trim()) {
                    return true;
                }

                const search: string = searchTopicValue.toLowerCase();

                return identifiedTopic.topic.toLowerCase().includes(search);
            })
            .map((topic: IdentifiedTopicI) => ({
                topic,
                transcriptFile,
            }));

        return acc.concat(matchingTopics);
    }, []);

    $: {
        topicCards = filteredIdentifiedTopics.map(
            ({ topic, transcriptFile }) => {
                const id: string = `${transcriptFile.id}-${topic.topic}`;

                return {
                    id,
                    topic,
                    transcriptFile,
                    isOpen: openCards.get(id) ?? false,
                };
            },
        );
    }

    const handleCreateNewTopicButtonClick = (): void => {};

    const toggleCard = (id: string): void => {
        openCards = new Map(openCards);
        openCards.set(id, !(openCards.get(id) ?? false));
    };
</script>

<div class="all-topics-tab-content-container">
    <div class="action-bar">
        <Search
            bind:value={searchTopicValue}
            placeholder="Search for a topic"
        />
        <Button
            kind="primary"
            icon={Add}
            on:click={handleCreateNewTopicButtonClick}
        >
            Create new topic
        </Button>
    </div>

    <div class="all-topics-container">
        {#each topicCards as topicCard (topicCard.id)}
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
                            on:click={() => {}}
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
                            <span class="topic-card-label">
                                Supporting quotes
                            </span>
                            <div class="supporting-quotes-container">
                                {#each topicCard.topic.quotes as quote (quote.line_number)}
                                    <Quote
                                        line_number={quote.line_number}
                                        timestamp={quote.timestamp}
                                        speaker={quote.speaker}
                                        quote={quote.quote}
                                    />
                                {/each}
                            </div>
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
        {/each}
    </div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .all-topics-tab-content-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
    }

    .action-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .all-topics-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

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

    .supporting-quotes-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    :global(.topic-card-button) {
        min-height: 1rem;
        padding: 7px !important;
    }
</style>
