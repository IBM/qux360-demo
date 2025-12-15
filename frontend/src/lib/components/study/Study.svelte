<script lang="ts">
    import { TranscriptContent } from "$lib/components";
    import { selectedTranscriptStore } from "$lib/stores";
    import { AllStudiesPanel, StudyContent } from ".";
</script>

<div class="study-external-container">
    <div class="all-studies-container">
        <AllStudiesPanel />
    </div>
    <div class="divider"></div>
    <div class="study-internal-container">
        {#if $selectedTranscriptStore}
            <TranscriptContent />
        {:else}
            <StudyContent />
        {/if}
    </div>
</div>

<style lang="scss">
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

    .study-internal-container {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .divider {
        width: 1px;
        background-color: var(--cds-border-subtle-selected);
    }
</style>
