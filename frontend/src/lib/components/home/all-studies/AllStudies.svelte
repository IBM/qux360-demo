<script lang="ts">
    import { Button, Checkbox, Search } from "carbon-components-svelte";
    import { Add } from "carbon-icons-svelte";

    export let isCreatingStudy: boolean;

    let searchStudyValue: string = "";

    const handleNewStudyButtonClick = (): void => {
        isCreatingStudy = true;
    };
</script>

<div class="home-container">
    <h4 class="home-header">Studies</h4>

    <div class="action-bar">
        <div class="filters-container">
            <Search
                bind:value={searchStudyValue}
                placeholder="Search for a study"
            />
            <div class="review-required-checkbox-container">
                <span class="bx--label">Filter</span>
                <Checkbox labelText="Review required" />
            </div>
        </div>
        <Button kind="primary" icon={Add} on:click={handleNewStudyButtonClick}>
            New study
        </Button>
    </div>
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
    }

    .filters-container {
        display: flex;
        gap: 1rem;
    }

    .review-required-checkbox-container {
        display: flex;
        flex-direction: column;
    }

    :global(.bx--search) {
        width: 350px;
    }
</style>
