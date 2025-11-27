<script lang="ts">
    import type { ProgressStepI } from "$lib/models";
    import { Button, TextInput } from "carbon-components-svelte";

    export let isCreatingStudy: boolean;
    export let currentStepIndex: number;
    export let steps: ProgressStepI[];
    export let studyName: string;
    export let studyDescription: string;

    const cancelButtonClick = () => {
        isCreatingStudy = false;
    };

    const nextButtonClick = () => {
        steps[currentStepIndex].isComplete = true;
        currentStepIndex++;
    };
</script>

<div class="new-study-information-container">
    <div class="inputs-container">
        <TextInput
            bind:value={studyName}
            labelText="Study name"
            placeholder=""
            required
        />

        <TextInput
            bind:value={studyDescription}
            labelText="Study description"
            helperText="Provide a 1-sentence summary of the study topic to improve the quality of AI assistance."
            placeholder=""
            required
        />
    </div>

    <div class="buttons-container">
        <Button kind="secondary" on:click={cancelButtonClick}>Cancel</Button>
        <Button
            kind="primary"
            disabled={studyName.trim() === "" || studyDescription.trim() === ""}
            on:click={nextButtonClick}
        >
            Next
        </Button>
    </div>
</div>

<style lang="scss">
    .new-study-information-container {
        display: flex;
        flex-direction: column;
        gap: 4rem;
    }

    .inputs-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
