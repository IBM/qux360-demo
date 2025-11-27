<script lang="ts">
    import type { ProgressStepI } from "$lib/models";
    import { ProgressIndicator, ProgressStep } from "carbon-components-svelte";
    import Information from "./Information.svelte";
    import Transcripts from "./Transcripts.svelte";

    let currentStepIndex: number = 0;
    let steps: ProgressStepI[] = [
        {
            id: 0,
            label: "Information",
            isComplete: false,
            component: Information,
        },
        {
            id: 1,
            label: "Transcripts",
            isComplete: false,
            component: Transcripts,
        },
    ];

    let studyName: string = "";
    let studyDescription: string = "";
</script>

<div class="new-study-container">
    <h4 class="new-study-header">Create new study</h4>

    <ProgressIndicator
        preventChangeOnClick
        spaceEqually
        currentIndex={currentStepIndex}
    >
        {#each steps as step (step.id)}
            <ProgressStep complete={step.isComplete} label={step.label} />
        {/each}
    </ProgressIndicator>

    {#if steps[currentStepIndex]}
        {#key currentStepIndex}
            <svelte:component
                this={steps[currentStepIndex].component}
                bind:currentStepIndex
                bind:steps
                bind:studyName
                bind:studyDescription
            />
        {/key}
    {/if}
</div>

<style lang="scss">
    @use "@carbon/type";

    .new-study-container {
        display: flex;
        flex-direction: column;
        width: 736px;
        gap: 2rem;
        padding: 2rem;
        background-color: var(--cds-ui-background, #ffffff);
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;
    }

    .new-study-header {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
    }
</style>
