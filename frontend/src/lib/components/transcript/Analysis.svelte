<script lang="ts">
    import { AILabel } from "$lib/common";
    import { ContentSwitcher, Switch } from "carbon-components-svelte";

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

    {#if selectedContentSwitcherIndex === 0}{:else if selectedContentSwitcherIndex === 1}{/if}
</div>

<style lang="scss">
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
</style>
