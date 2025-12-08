<script lang="ts">
    import {
        READY_FOR_ANONYMIZATION_TRANSCRIPT_STATUS,
        RUNNING_ANONYMIZATION_TRANSCRIPT_STATUS,
    } from "$lib/common";
    import {
        ValidationStatus,
        type SpeakerAnonymizationMap,
    } from "$lib/models";
    import {
        selectedStudyStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import { Button, TextInput } from "carbon-components-svelte";

    let speakerAnonymizationMap: SpeakerAnonymizationMap | null = null;

    $: if ($selectedTranscriptStore) {
        speakerAnonymizationMap =
            $selectedTranscriptStore.speaker_anonymization_map;
    }

    const runTranscriptSpeakerAnonymization = async (): Promise<void> => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            await studiesStore.runTranscriptSpeakerAnonymization(
                $selectedStudyStore,
                $selectedTranscriptStore.id,
            );
        }
    };
</script>

<div class="speaker-anonymization-container">
    <h3 class="transcript-section-title">Speaker anonymization</h3>
    {#if !$selectedTranscriptStore || !$selectedTranscriptStore.validation || $selectedTranscriptStore.validation.status !== ValidationStatus.Ok}
        <p class="confirm-participant-text">
            Confirm participant to start anonymization.
        </p>
    {:else if $selectedTranscriptStore.status === READY_FOR_ANONYMIZATION_TRANSCRIPT_STATUS}
        <Button
            kind="primary"
            size="field"
            on:click={async () => {
                await runTranscriptSpeakerAnonymization();
            }}
        >
            Run anonymization
        </Button>
    {:else if $selectedTranscriptStore.status === RUNNING_ANONYMIZATION_TRANSCRIPT_STATUS}
        <Button skeleton size="field" />
    {:else if speakerAnonymizationMap}
        {#each Object.entries(speakerAnonymizationMap) as [name, alias]}
            <div class="speaker-anonymization-line-container">
                <TextInput labelText="Speaker name" value={name} />
                <TextInput labelText="Replacement text" value={alias} />
            </div>
        {/each}
    {/if}
</div>

<style lang="scss">
    @use "@carbon/type";

    .speaker-anonymization-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .confirm-participant-text {
        @include type.type-style("body-01");
        line-height: 1.25rem;
    }

    .speaker-anonymization-line-container {
        display: flex;
        gap: 1rem;
    }
</style>
