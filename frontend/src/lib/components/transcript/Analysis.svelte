<script lang="ts">
    import { AILabel } from "$lib/common";
    import { ContentSwitcher, Switch } from "carbon-components-svelte";
    import { ApprovedTopics, SuggestedTopics } from "./analysis";

    let selectedContentSwitcherIndex: number = 0;
</script>

<div class="transcript-analysis-container">
    <h3 class="transcript-section-title">Topics</h3>

    <ContentSwitcher bind:selectedIndex={selectedContentSwitcherIndex}>
        <Switch text="Approved topics" />
        <Switch>
            <div class="suggested-topics-content-switcher-title-container">
                <span>Suggested topics</span>
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
        <ApprovedTopics />
    {:else if selectedContentSwitcherIndex === 1}
        <SuggestedTopics />
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

    :global(.topic-name-link) {
        cursor: pointer;
    }
</style>
