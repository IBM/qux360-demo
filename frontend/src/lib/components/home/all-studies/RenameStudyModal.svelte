<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { studiesStore } from "$lib/stores";
    import { Modal, TextInput } from "carbon-components-svelte";

    export let isModalOpen: boolean;
    export let study: StudyI;
    export let studyName: string;

    const handleCancelButtonClick = (): void => {
        isModalOpen = false;
    };

    const handleRenameButtonClick = (): void => {
        studiesStore.update({
            ...study,
            name: studyName,
        });
        isModalOpen = false;
    };
</script>

<Modal
    bind:open={isModalOpen}
    modalHeading="Rename study"
    secondaryButtonText="Cancel"
    primaryButtonText="Rename"
    primaryButtonDisabled={studyName.trim() === ""}
    on:click:button--secondary={handleCancelButtonClick}
    on:click:button--primary={handleRenameButtonClick}
>
    <TextInput bind:value={studyName} labelText="Study name" placeholder="" />
</Modal>

<style lang="scss"></style>
