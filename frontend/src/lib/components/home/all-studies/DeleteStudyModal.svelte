<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { studiesStore } from "$lib/stores";
    import { Modal } from "carbon-components-svelte";

    export let isModalOpen: boolean;
    export let studyToDelete: StudyI;

    const handleCancelButtonClick = (): void => {
        isModalOpen = false;
    };

    const handleDeleteButtonClick = (): void => {
        studiesStore.delete(studyToDelete.id);
        isModalOpen = false;
    };
</script>

<Modal
    danger
    bind:open={isModalOpen}
    modalHeading="Delete study"
    secondaryButtonText="Cancel"
    primaryButtonText="Delete"
    on:click:button--secondary={handleCancelButtonClick}
    on:click:button--primary={handleDeleteButtonClick}
>
    <p>This is a permanent action and cannot be undone.</p>
</Modal>

<style lang="scss"></style>
