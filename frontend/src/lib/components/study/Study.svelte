<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { selectedStudyIdStore, studiesStore } from "$lib/stores";
    import { Accordion, AccordionItem, Stack } from "carbon-components-svelte";

    const handleStudyItemClick = (study: StudyI): void => {
        selectedStudyIdStore.set(study.id);
    };
</script>

<div class="study-external-container">
    <div class="all-studies-container">
        <h4 class="all-studies-header">All studies</h4>
        <Accordion>
            {#each $studiesStore as study (`${study.id}-${$selectedStudyIdStore}`)}
                <AccordionItem
                    class="study-item"
                    open={study.id === $selectedStudyIdStore}
                    on:click={() => {
                        handleStudyItemClick(study);
                    }}
                >
                    <div
                        slot="title"
                        class="study-item-title"
                        class:study-item-title-selected={study.id ===
                            $selectedStudyIdStore}
                    >
                        {study.name}
                    </div>
                    <Stack gap={3}>
                        {#each study.transcriptFiles as transcriptFile (transcriptFile.name)}
                            <div class="transcript-file-item-container">
                                <span class="transcript-file-name">
                                    {transcriptFile.name}
                                </span>
                            </div>
                        {/each}
                    </Stack>
                </AccordionItem>
            {/each}
        </Accordion>
    </div>
    <div class="divider"></div>
    <div class="study-internal-container"></div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .study-external-container {
        display: flex;
        height: 100%;
    }

    .all-studies-container,
    .study-internal-container {
        height: 100%;
        overflow: auto;
    }

    .all-studies-container {
        width: 392px;
    }

    .divider {
        width: 1px;
        background-color: var(--cds-border-subtle-selected);
    }

    .all-studies-header {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
        padding-top: 2rem;
        padding-bottom: 1rem;
        padding-left: 2.5rem;
        padding-right: 2.5rem;
    }

    .study-item-title {
        @include type.type-style("body-02");
    }

    .study-item-title-selected {
        font-weight: 700;
    }

    .transcript-file-item-container {
        display: flex;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        padding-left: 3.5rem;
        padding-right: 1rem;
    }

    .transcript-file-item-container:hover {
        cursor: pointer;
        background-color: var(--cds-hover-light-ui);
        user-select: none;
    }

    .transcript-file-name {
        @include type.type-style("body-compact-02");
    }

    :global(.study-item .bx--accordion__title) {
        margin: 0 0 0 2.5rem;
    }

    :global(.study-item .bx--accordion__heading) {
        min-height: 2.375rem; // 38px
        padding: 0.4375rem 0; // 7px 0
    }

    :global(.study-item .bx--accordion__heading[aria-expanded="true"]) {
        background-color: var(--cds-tag-background-blue);
    }

    :global(.study-item .bx--accordion__content) {
        padding: 1rem 0;
    }
</style>
