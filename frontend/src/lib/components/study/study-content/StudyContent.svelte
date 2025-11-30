<script lang="ts">
    import type { TabI } from "$lib/models";
    import { selectedStudyIdStore, selectedStudyStore } from "$lib/stores";
    import { Button } from "carbon-components-svelte";
    import { ArrowLeft } from "carbon-icons-svelte";
    import { Transcripts } from ".";

    enum TabID {
        Transcripts = "transcripts",
        AllTopics = "all-topics",
        Themes = "themes",
    }

    const tabs: TabI[] = [
        { id: TabID.Transcripts, label: "Transcripts" },
        { id: TabID.AllTopics, label: "All topics" },
        { id: TabID.Themes, label: "Themes" },
    ];

    let activeTab: string = TabID.Transcripts;

    const handleBackButtonClick = (): void => {
        selectedStudyIdStore.set(null);
    };

    const selectTab = (id: string): void => {
        activeTab = id;
    };
</script>

{#if $selectedStudyStore}
    <div class="study-content-header-external-container">
        <div class="study-content-header-internal-container">
            <Button
                class="back-button"
                kind="ghost"
                size="small"
                on:click={handleBackButtonClick}
            >
                <ArrowLeft size={24} />
            </Button>
            <h4 class="study-content-header">{$selectedStudyStore.name}</h4>
        </div>
    </div>
    <div class="tabs-container">
        <ul class="bx--tabs__nav bx--tabs__nav--hidden">
            {#each tabs as tab (tab.id)}
                <li class="bx--tabs__nav-item">
                    <a
                        role="tab"
                        tabindex="0"
                        aria-selected={activeTab === tab.id}
                        aria-disabled="false"
                        class="bx--tabs__nav-link {activeTab === tab.id
                            ? 'bx--tabs__nav-item--selected'
                            : ''}"
                        on:click={() => selectTab(tab.id)}
                    >
                        {tab.label}
                    </a>
                </li>
            {/each}
        </ul>
    </div>
    {#if activeTab === TabID.Transcripts}
        <Transcripts transcriptFiles={$selectedStudyStore.transcriptFiles} />
    {/if}
{/if}

<style lang="scss">
    @use "@carbon/type";

    .study-content-header-external-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2rem 1rem 1rem;
    }

    .study-content-header-internal-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .study-content-header {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
    }

    .tabs-container {
        position: relative;
        height: calc(2.5rem - 0.5px);
        border-bottom: 1px solid var(--cds-border-subtle-selected);
    }

    .bx--tabs__nav-link {
        width: auto;
        border-color: var(--cds-border-subtle-selected);
    }

    .bx--tabs__nav-link:active,
    .bx--tabs__nav-link:focus {
        width: auto;
        outline: unset;
        outline-offset: unset;
        border-bottom: 2px solid var(--cds-interactive-04);
    }

    .bx--tabs__nav-item--selected {
        border-bottom: 2px solid var(--cds-interactive-04);
    }

    :global(.back-button) {
        padding: 3px !important;
    }
</style>
