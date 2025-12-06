<script lang="ts">
    import { StudyContentTabID, Tabs } from "$lib/common";
    import type { TabI } from "$lib/models";
    import { selectedStudyIdStore, selectedStudyStore } from "$lib/stores";
    import { Button } from "carbon-components-svelte";
    import { ArrowLeft, Settings } from "carbon-icons-svelte";
    import { Transcripts } from ".";

    const tabs: TabI[] = [
        { id: StudyContentTabID.Transcripts, label: "Transcripts" },
        { id: StudyContentTabID.AllTopics, label: "All topics" },
        { id: StudyContentTabID.Themes, label: "Themes" },
    ];

    let activeTab: string = StudyContentTabID.Transcripts;

    const handleBackButtonClick = (): void => {
        selectedStudyIdStore.set(null);
    };

    const handleAISettingsButtonClick = (): void => {
        // TODO: Add functionality
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
        <Button
            kind="ghost"
            icon={Settings}
            on:click={handleAISettingsButtonClick}
        >
            AI settings
        </Button>
    </div>

    <Tabs {tabs} bind:activeTab />

    {#if activeTab === StudyContentTabID.Transcripts}
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
</style>
