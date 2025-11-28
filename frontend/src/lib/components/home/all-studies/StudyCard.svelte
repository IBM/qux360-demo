<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";
    import { TrashCan } from "carbon-icons-svelte";
    import { DeleteStudyModal } from ".";

    export let study: StudyI;

    let isDeleteStudyModalOpen: boolean = false;

    const handleDeleteStudyOptionClick = (): void => {
        isDeleteStudyModalOpen = true;
    };
</script>

<div class="study-card-container">
    <div class="study-details-container">
        <span class="study-detail-text">{study.name}</span>
        <div class="separator"></div>
        <span class="study-detail-text">
            {study.transcriptFiles.length} interviews
        </span>
    </div>

    <OverflowMenu class="study-card-overflow-menu" flipped size="xl">
        <OverflowMenuItem text="Rename study" on:click={() => {}} />
        <OverflowMenuItem text="AI settings" on:click={() => {}} />
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
        background-color: var(--cds-ui-background, #ffffff);
        box-shadow: 2px 4px 12px 0px #00000014;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;
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
