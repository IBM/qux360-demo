<script lang="ts">
    import { ParticipantIdentification, TranscriptLines } from ".";
</script>

<div class="transcript-information-tab-content-container">
    <div class="left-content-container">
        <ParticipantIdentification />

        <h3 class="transcript-section-title">Speaker anonymization</h3>

        <h3 class="transcript-section-title">Entity anonymization</h3>
    </div>
    <div class="right-content-container">
        <TranscriptLines />
    </div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-information-tab-content-container {
        flex: 1;
        display: flex;
        overflow: auto;
    }

    .left-content-container,
    .right-content-container {
        flex: 1;
    }

    .left-content-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding-top: 2rem;
        padding-bottom: 2rem;
        padding-left: 2rem;
        padding-right: 1rem;
    }

    .right-content-container {
        display: flex;
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 1rem;
        padding-right: 2rem;
    }

    :global(.transcript-section-title) {
        @include type.type-style("heading-03");
        line-height: 1.75rem;
    }
</style>
