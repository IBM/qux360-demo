<script lang="ts">
    import type { StudyI } from "$lib/models";
    import {
        Modal,
        RadioButton,
        RadioButtonGroup,
    } from "carbon-components-svelte";

    export let isModalOpen: boolean;
    export let study: StudyI;

    const handleCancelButtonClick = (): void => {
        isModalOpen = false;
    };

    const handleSaveButtonClick = (): void => {
        // TODO: Add functionality
        isModalOpen = false;
    };
</script>

<Modal
    bind:open={isModalOpen}
    modalHeading="AI settings"
    secondaryButtonText="Cancel"
    primaryButtonText="Save"
    on:click:button--secondary={handleCancelButtonClick}
    on:click:button--primary={handleSaveButtonClick}
>
    <RadioButtonGroup
        orientation="vertical"
        legendText="Overall validation strategy"
        name="ai-settings"
    >
        <RadioButton
            labelText="Strictest: Show worst status"
            value="strictest"
        />
        <RadioButton
            labelText="Consensus: All validations must agree on high quality, otherwise show uncertain quality"
            value="consensus"
        />
        <RadioButton
            labelText="Majority: Show most frequently occurring status"
            value="majority"
        />
    </RadioButtonGroup>
</Modal>

<style lang="scss"></style>
