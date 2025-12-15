<script lang="ts">
    import { AILabel } from "$lib/common";
    import type { IdentifiedTopicI } from "$lib/models";
    import { selectedTranscriptStore } from "$lib/stores";
    import { ContentSwitcher, Switch } from "carbon-components-svelte";
    import { ApprovedTopics, SuggestedTopics } from "./analysis";

    let approvedIdentifiedTopics: IdentifiedTopicI[] = [];
    let suggestedIdentifiedTopics: IdentifiedTopicI[] = [];

    let selectedContentSwitcherIndex: number = 0;

    $: if ($selectedTranscriptStore) {
        approvedIdentifiedTopics = $selectedTranscriptStore.topics.filter(
            (topic: IdentifiedTopicI) =>
                topic.validation && topic.validation.isApprovedByUser,
        );

        suggestedIdentifiedTopics = $selectedTranscriptStore.topics.filter(
            (topic: IdentifiedTopicI) =>
                topic.validation && !topic.validation.isApprovedByUser,
        );
    }
</script>

<div class="transcript-analysis-container">
    <h3 class="transcript-section-title">Topics</h3>

    <ContentSwitcher bind:selectedIndex={selectedContentSwitcherIndex}>
        <Switch>
            <span>Approved topics ({approvedIdentifiedTopics.length})</span>
        </Switch>
        <Switch>
            <div class="suggested-topics-content-switcher-title-container">
                <span>
                    Suggested topics ({suggestedIdentifiedTopics.length})
                </span>
                <AILabel
                    headerText="Suggested topics"
                    bodyText="AI is used to identify major topics in the transcript and provide supporting quotes. Major topics are determined based on the study description you provided."
                    modelName="granite.13b.v2.instruct"
                    modelLink=""
                    alignment="bottom-right"
                    kind="inline"
                />
            </div>
        </Switch>
    </ContentSwitcher>

    {#if selectedContentSwitcherIndex === 0}
        <ApprovedTopics identifiedTopics={approvedIdentifiedTopics} />
    {:else if selectedContentSwitcherIndex === 1}
        <SuggestedTopics identifiedTopics={suggestedIdentifiedTopics} />
    {/if}
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-analysis-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .suggested-topics-content-switcher-title-container {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    :global(.topics-label) {
        @include type.type-style("heading-02");
    }

    :global(.topic-names-external-container) {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    :global(.topic-names-vertical-line-container) {
        display: flex;
    }

    :global(.vertical-line) {
        width: 1px;
        height: calc(100% - 9px);
        background-color: black;
    }

    :global(.topic-names-internal-container) {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
    }

    :global(.topic-name-container) {
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }

    :global(.horizonal-line) {
        width: 0.75rem;
        height: 1px;
        background-color: black;
    }

    :global(.topic-card-header-container) {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    :global(.topic-card-header-internal-container) {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    :global(.topic-card-title-text) {
        @include type.type-style("heading-02");
    }

    :global(.topic-card-internal-container) {
        display: flex;
        flex-direction: column;
    }

    :global(.topic-card-label) {
        @include type.type-style("body-compact-01");
        font-weight: 700;
        line-height: 1.125rem;
    }

    :global(.topic-card-text) {
        @include type.type-style("body-compact-01");
        line-height: 1.125rem;
    }
</style>
