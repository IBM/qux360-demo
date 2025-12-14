<script lang="ts">
    import {
        TranscriptStatus,
        type SpeakerAnonymizationMap,
    } from "$lib/models";
    import {
        selectedStudyStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import { Button, SkeletonText, TextInput } from "carbon-components-svelte";
    import { Close } from "carbon-icons-svelte";

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

    const updateAlias = (speaker: string, alias: string): void => {
        if (
            $selectedStudyStore &&
            $selectedTranscriptStore &&
            $selectedTranscriptStore.id
        ) {
            studiesStore.updateSpeakerAnonymizationAlias(
                $selectedStudyStore.id,
                $selectedTranscriptStore.id,
                speaker,
                alias,
            );
        }
    };

    const clearAlias = (speaker: string): void => {
        updateAlias(speaker, "");
    };
</script>

<div class="speaker-anonymization-container">
    <h3 class="transcript-section-title">Speaker anonymization</h3>
    {#if !$selectedTranscriptStore || $selectedTranscriptStore.status === TranscriptStatus.RunningParticipantIdentification}
        <SkeletonText width="17rem" />
    {:else if $selectedTranscriptStore.status === TranscriptStatus.ParticipantNeedsReview}
        <p class="confirm-participant-text">
            Confirm participant to start anonymization.
        </p>
    {:else if $selectedTranscriptStore.status === TranscriptStatus.ReadyForAnonymization}
        <Button
            class="run-anonymization-button"
            kind="primary"
            size="field"
            on:click={async () => {
                await runTranscriptSpeakerAnonymization();
            }}
        >
            Run anonymization
        </Button>
    {:else if $selectedTranscriptStore.status === TranscriptStatus.RunningAnonymization}
        <Button skeleton size="field" />
    {:else if speakerAnonymizationMap}
        {#each Object.entries(speakerAnonymizationMap) as [name, alias]}
            <div class="speaker-anonymization-item-container">
                <TextInput labelText="Speaker name" value={name} readonly />
                <TextInput
                    labelText="Replacement text"
                    value={alias}
                    on:input={(event: CustomEvent) => {
                        updateAlias(name, event.detail);
                    }}
                />
                <Button
                    class="close-speaker-anonymization-item-button"
                    kind="ghost"
                    size="small"
                    on:click={() => clearAlias(name)}
                >
                    <Close size={16} />
                </Button>
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

    .speaker-anonymization-item-container {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
    }

    :global(.close-speaker-anonymization-item-button) {
        color: black;
        padding: 3px !important;
        margin-bottom: 0.25rem;
    }
</style>
