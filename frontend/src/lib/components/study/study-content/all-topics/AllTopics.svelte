<script lang="ts">
    import type {
        IdentifiedTopicI,
        IdentifiedTopicWithTranscriptI,
        TopicCardI,
        TranscriptFileI,
    } from "$lib/models";
    import { Button, Search } from "carbon-components-svelte";
    import { Add } from "carbon-icons-svelte";
    import { TopicCard } from ".";

    export let transcriptFiles: TranscriptFileI[];

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
            <TopicCard bind:topicCard bind:openCards />
        {/each}
    </div>
</div>

<style lang="scss">
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
</style>
