<script lang="ts">
    import { UploadTranscriptFiles } from "$lib/common";
    import {
        StudyStatus,
        UploadedTranscriptFileStatus,
        ValidationStrategy,
        type ProgressStepI,
        type StudyI,
        type TranscriptFileI,
        type UploadedTranscriptFileI,
    } from "$lib/models";
    import { utilsService } from "$lib/services";
    import { loadingRequestStore, studiesStore } from "$lib/stores";
    import { Button } from "carbon-components-svelte";

    export let isCreatingStudy: boolean;
    export let currentStepIndex: number;
    export let steps: ProgressStepI[];
    export let studyName: string;
    export let studyDescription: string;

    let uploadedTranscriptFiles: UploadedTranscriptFileI[] = [];

    let hasValidFiles: boolean = false;

    $: hasValidFiles = uploadedTranscriptFiles.some(
        (uploadedTranscriptFile) =>
            uploadedTranscriptFile.status ===
            UploadedTranscriptFileStatus.Success,
    );

    const cancelButtonClick = (): void => {
        currentStepIndex--;
        steps[currentStepIndex].isComplete = false;
    };

    const createButtonClick = async (): Promise<void> => {
        const successfulFiles: File[] = uploadedTranscriptFiles
            .filter(
                (uploadedTranscriptFile) =>
                    uploadedTranscriptFile.status ===
                    UploadedTranscriptFileStatus.Success,
            )
            .map((uploadedTranscriptFile) => uploadedTranscriptFile.file);

        const transcriptFiles: TranscriptFileI[] = successfulFiles.map(
            (file: File) => {
                return utilsService.getTranscriptFile(file);
            },
        );

        const newStudy: StudyI = {
            id: "",
            name: studyName,
            description: studyDescription,
            transcriptFiles: transcriptFiles,
            status: StudyStatus.Ready,
            validation_strategy: ValidationStrategy.Strictest,
        };
        loadingRequestStore.startLoadingRequest();
        await studiesStore.add(newStudy);
        loadingRequestStore.stopLoadingRequest();

        steps[currentStepIndex].isComplete = true;
        isCreatingStudy = false;

        studiesStore.runTranscriptFilesParticipantIdentification(newStudy);
    };
</script>

<UploadTranscriptFiles bind:uploadedTranscriptFiles />

<div class="buttons-container">
    <Button kind="secondary" on:click={cancelButtonClick}>Cancel</Button>
    <Button
        kind="primary"
        disabled={!hasValidFiles}
        on:click={async () => {
            await createButtonClick();
        }}
    >
        Create
    </Button>
</div>

<style lang="scss">
</style>
