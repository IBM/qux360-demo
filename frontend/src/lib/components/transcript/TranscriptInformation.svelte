<script lang="ts">
    import { AILabel } from "$lib/common";
    import { Search } from "carbon-components-svelte";

    let searchQuoteOrTopicValue: string = "";
</script>

<div class="transcript-information-tab-content-container">
    <div class="left-content-container">
        <div class="participant-identification-title-container">
            <h3 class="section-title">Participant identification</h3>
            <AILabel
                headerText="Participant identification"
                bodyText="AI is used to identify which speaker is the interviewee based on conversation patterns and content."
                modelName="granite.13b.v2.instruct"
                modelLink=""
            />
        </div>
        <h3 class="section-title">Speaker anonymization</h3>
        <h3 class="section-title">Entity anonymization</h3>
    </div>
    <div class="right-content-container">
        <h3 class="section-title">Transcript</h3>
        <Search
            bind:value={searchQuoteOrTopicValue}
            placeholder="Search for a quote or topic"
        />
    </div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-information-tab-content-container {
        flex: 1;
        display: flex;
        padding: 2rem;
    }

    .left-content-container,
    .right-content-container {
        flex: 1;
    }

    .right-content-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: -1rem 0;
        padding: 1.5rem 2rem;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;
    }

    .participant-identification-title-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .section-title {
        @include type.type-style("heading-03");
        line-height: 1.75rem;
    }
</style>
