<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { selectedStudyIdStore } from "$lib/stores";
    import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";
    import { TrashCan } from "carbon-icons-svelte";
    import { AISettingsModal, DeleteStudyModal, RenameStudyModal } from ".";

    export let study: StudyI;

    let isRenameStudyModalOpen: boolean = false;
    let isAISettingsModalOpen: boolean = false;
    let isDeleteStudyModalOpen: boolean = false;

    const handleStudyCardClick = (): void => {
        selectedStudyIdStore.set(study.id);
    };

    const handleRenameStudyOptionClick = (): void => {
        isRenameStudyModalOpen = true;
    };

    const handleAISettingsOptionClick = (): void => {
        isAISettingsModalOpen = true;
    };

    const handleDeleteStudyOptionClick = (): void => {
        isDeleteStudyModalOpen = true;
    };
</script>

<div class="study-card-container" on:click|self={handleStudyCardClick}>
    <div class="study-details-container" on:click={handleStudyCardClick}>
        <span class="study-detail-text">{study.name}</span>
        <div class="separator"></div>
        <span class="study-detail-text">
            {study.transcriptFiles.length} interviews
        </span>
    </div>

    <OverflowMenu class="study-card-overflow-menu" flipped size="xl">
        <OverflowMenuItem
            text="Rename study"
            on:click={() => {
                handleRenameStudyOptionClick();
            }}
        />
        <OverflowMenuItem
            text="AI settings"
            on:click={() => {
                handleAISettingsOptionClick();
            }}
        />
        <OverflowMenuItem
            danger
            hasDivider
            on:click={() => {
                handleDeleteStudyOptionClick();
            }}
        >
            <div class="delete-item-container">
                <span>Delete</span>
                <TrashCan></TrashCan>
            </div>
        </OverflowMenuItem>
    </OverflowMenu>
</div>

{#key isRenameStudyModalOpen}
    {#if isRenameStudyModalOpen}
        <RenameStudyModal
            bind:isModalOpen={isRenameStudyModalOpen}
            {study}
            studyName={study.name}
        />
    {/if}
{/key}

{#key isAISettingsModalOpen}
    {#if isAISettingsModalOpen}
        <AISettingsModal bind:isModalOpen={isAISettingsModalOpen} {study} />
    {/if}
{/key}

{#key isDeleteStudyModalOpen}
    {#if isDeleteStudyModalOpen}
        <DeleteStudyModal
            bind:isModalOpen={isDeleteStudyModalOpen}
            studyToDelete={study}
        />
    {/if}
{/key}

<style lang="scss">
    @use "@carbon/type";

    .study-card-container {
        display: flex;
        align-items: center;
        padding: 2rem 1rem;
        background-color: var(--cds-ui-background);
        box-shadow: 2px 4px 12px 0px #00000014;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;

        transition:
            background-color 120ms ease,
            border-color 120ms ease;
    }

    .study-card-container:hover {
        cursor: pointer;
        background-color: var(--cds-hover-ui);
        border-color: var(--cds-border-interactive);
    }

    :global(.study-card-container:has(.study-card-overflow-menu:hover)) {
        cursor: default;
        background-color: var(--cds-ui-background);
        border-color: var(--cds-border-subtle-selected);
    }

    .study-details-container {
        display: flex;
        align-items: center;
        flex: 1;
        height: fit-content;
        gap: 0.875rem;
    }

    .study-detail-text {
        @include type.type-style("body-compact-02");
    }

    .separator {
        width: 4px;
        height: 4px;
        background-color: #8d8d8d;
        border-radius: 50%;
    }

    .delete-item-container {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    :global(.study-card-overflow-menu) {
        width: 2rem;
        height: 2rem;
    }
</style>
