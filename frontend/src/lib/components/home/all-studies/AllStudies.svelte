<script lang="ts">
    import type { StudyI } from "$lib/models";
    import { studiesStore } from "$lib/stores";
    import { Button, Checkbox, Search, Stack } from "carbon-components-svelte";
    import { Add } from "carbon-icons-svelte";
    import { StudyCard } from ".";

    export let isCreatingStudy: boolean;

    let filteredStudies: StudyI[] = [];
    let searchStudyValue: string = "";

    $: filteredStudies = $studiesStore.filter((study: StudyI) =>
        study.name.toLowerCase().includes(searchStudyValue.toLowerCase()),
    );

    const handleNewStudyButtonClick = (): void => {
        isCreatingStudy = true;
    };
</script>

<div class="home-container">
    <h4 class="home-header">Studies</h4>

    <div class="action-bar">
        <Stack gap={5} orientation="horizontal">
            <Search
                bind:value={searchStudyValue}
                placeholder="Search for a study"
            />
            <div class="review-required-checkbox-container">
                <span class="bx--label">Filter</span>
                <Checkbox class="checkbox" labelText="Review required" />
            </div>
        </Stack>
        <Button kind="primary" icon={Add} on:click={handleNewStudyButtonClick}>
            New study
        </Button>
    </div>

    {#if filteredStudies.length > 0}
        <Stack gap={5}>
            {#each filteredStudies as study (study.id)}
                <StudyCard {study} />
            {/each}
        </Stack>
    {/if}
</div>

<style lang="scss">
    @use "@carbon/type";

    .home-container {
        display: flex;
        flex-direction: column;
        width: 1119px;
    }

    .home-header {
        @include type.type-style("heading-04");
        line-height: 2.25rem;
        margin-bottom: 1rem;
    }

    .action-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2rem;
    }

    .review-required-checkbox-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>
