<script lang="ts">
    import type { ProgressStepI } from "$lib/models";
    import { Button, Stack, TextInput } from "carbon-components-svelte";

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

<Stack gap={10}>
    <Stack gap={5}>
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
    </Stack>

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
</Stack>

<style lang="scss">
</style>
