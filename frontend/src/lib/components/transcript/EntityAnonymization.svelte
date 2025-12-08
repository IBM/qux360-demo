<script lang="ts">
    import { AILabel } from "$lib/common";
    import type { EntityAnonymizationMap } from "$lib/models";
    import {
        selectedStudyStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import { Button, Modal, TextInput } from "carbon-components-svelte";
    import { Add, Close } from "carbon-icons-svelte";
    import { onMount } from "svelte";

    let runEntityAnonymizationButtonContentElementRef: HTMLElement;

    let entityAnonymizationMap: EntityAnonymizationMap = {};

    let isAddEntityModalOpen: boolean = false;
    let isExistingEntity: boolean = false;
    let newEntityName: string = "";

    $: if ($selectedTranscriptStore) {
        entityAnonymizationMap =
            $selectedTranscriptStore.entity_anonymization_map;
    }

    $: isAddEntityModalOpen, (newEntityName = "");
    $: isExistingEntity = newEntityName in entityAnonymizationMap;

    onMount(() => {
        requestAnimationFrame(() => {
            const shadow: ShadowRoot | null | undefined =
                runEntityAnonymizationButtonContentElementRef?.lastElementChild
                    ?.shadowRoot;
            if (!shadow) {
                return;
            }

            const style: HTMLStyleElement = document.createElement("style");
            style.textContent = `
                .cds--slug__text {
                    color: white !important;
                }

                .cds--slug__text::before {
                    background: white !important;
                }
            `;
            shadow.appendChild(style);
        });
    });

    const runTranscriptEntityAnonymizationWithAI =
        async (): Promise<void> => {};

    const handleAddEntityButtonClick = (): void => {
        isAddEntityModalOpen = true;
    };

    const updateAlias = (entity: string, alias: string): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.updateEntityAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                entity,
                alias,
            );
        }
    };

    const removeAlias = (entity: string): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.removeEntityAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                entity,
            );
        }
    };

    const handleAddEntityModalCancelButtonClick = (): void => {
        isAddEntityModalOpen = false;
    };

    const handleAddEntityModalAddButtonClick = (): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.updateEntityAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                newEntityName,
                "",
            );
        }
        isAddEntityModalOpen = false;
    };
</script>

<div class="entity-anonymization-container">
    <h3 class="transcript-section-title">Entity anonymization</h3>
    <div class="entity-anonymization-buttons-container">
        <Button
            class="run-anonymization-button run-entity-anonymization-button"
            kind="primary"
            size="field"
            on:click={async () => {
                await runTranscriptEntityAnonymizationWithAI();
            }}
        >
            <div
                bind:this={runEntityAnonymizationButtonContentElementRef}
                class="run-anonymization-button-content-container"
            >
                Run anonymization
                <AILabel
                    headerText="Entity anonymization"
                    bodyText="AI is used to identify sensitive entities to anonymize, such as names, locations, and organizations."
                    modelName="granite.13b.v2.instruct"
                    modelLink=""
                    alignment="top-left"
                    kind="inline"
                />
            </div>
        </Button>
        <Button
            kind="tertiary"
            size="field"
            icon={Add}
            on:click={handleAddEntityButtonClick}
        >
            Add entity
        </Button>
    </div>
    {#each Object.entries(entityAnonymizationMap) as [entity, alias]}
        <div class="entity-anonymization-item-container">
            <TextInput labelText="Entity" value={entity} readonly />
            <TextInput
                labelText="Replacement text"
                value={alias}
                on:input={(event: CustomEvent) => {
                    updateAlias(entity, event.detail);
                }}
            />
            <Button
                class="close-entity-anonymization-item-button"
                kind="ghost"
                size="small"
                on:click={() => removeAlias(entity)}
            >
                <Close size={16} />
            </Button>
        </div>
    {/each}
</div>

<Modal
    bind:open={isAddEntityModalOpen}
    modalHeading="Add entity"
    size="sm"
    secondaryButtonText="Cancel"
    primaryButtonText="Add"
    primaryButtonDisabled={newEntityName.trim() === "" || isExistingEntity}
    on:click:button--secondary={handleAddEntityModalCancelButtonClick}
    on:click:button--primary={handleAddEntityModalAddButtonClick}
>
    <TextInput
        bind:value={newEntityName}
        labelText="Entity"
        placeholder=""
        invalid={isExistingEntity}
        invalidText="This entity has already been previously added to be anonymized"
    />
</Modal>

<style lang="scss">
    .entity-anonymization-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .entity-anonymization-buttons-container {
        display: flex;
        gap: 0.5rem;
    }

    .run-anonymization-button-content-container {
        display: flex;
        gap: 0.25rem;
    }

    .entity-anonymization-item-container {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
    }

    :global(.run-entity-anonymization-button) {
        padding-right: 12px;
    }

    :global(.close-entity-anonymization-item-button) {
        color: black;
        padding: 3px !important;
        margin-bottom: 0.25rem;
    }
</style>
