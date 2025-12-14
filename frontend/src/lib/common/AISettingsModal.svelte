<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { studiesStore } from "$lib/stores";
    import {
        Modal,
        RadioButton,
        RadioButtonGroup,
    } from "carbon-components-svelte";
    import { VALIDATION_STRATEGY_MAP } from "./constants";

    export let isModalOpen: boolean;
    export let study: StudyI;

    const handleCancelButtonClick = (): void => {
        isModalOpen = false;
    };

    const handleSaveButtonClick = (): void => {
        studiesStore.updateValidationStrategy(
            study.id,
            study.validation_strategy,
        );
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
        bind:selected={study.validation_strategy}
        orientation="vertical"
        legendText="Overall validation strategy"
        name="ai-settings"
    >
        {#each Object.entries(VALIDATION_STRATEGY_MAP) as [strategy, description]}
            <RadioButton
                labelText={`${strategy}: ${description}`}
                value={strategy}
            />
        {/each}
    </RadioButtonGroup>
</Modal>

<style lang="scss"></style>
