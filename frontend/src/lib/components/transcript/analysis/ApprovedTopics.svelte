<script lang="ts">
    import type { IdentifiedTopicI } from "$lib/models";
    import { selectedTranscriptStore } from "$lib/stores";
    import { Link } from "carbon-components-svelte";

    let identifiedTopics: IdentifiedTopicI[] = [];

    $: if ($selectedTranscriptStore) {
        identifiedTopics = $selectedTranscriptStore.topics;
    }
</script>

<div class="topic-names-external-container">
    <h4 class="topics-label">Approved topics</h4>

    <div class="topic-names-vertical-line-container">
        <div class="vertical-line"></div>
        <div class="topic-names-internal-container">
            {#each identifiedTopics as identifiedTopic, index (index)}
                <div class="topic-name-container">
                    <div class="horizonal-line"></div>
                    <Link class="topic-name-link" on:click={() => {}}>
                        {identifiedTopic.topic}
                    </Link>
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="scss"></style>
