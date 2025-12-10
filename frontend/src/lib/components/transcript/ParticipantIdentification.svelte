<script lang="ts">
    import {
        AILabel,
        RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS,
    } from "$lib/common";
    import { ValidationStatus, type DropdownItem } from "$lib/models";
    import { selectedTranscriptStore } from "$lib/stores";
    import { Dropdown, DropdownSkeleton } from "carbon-components-svelte";

    let speakersDropdownItems: DropdownItem[] = [];
    let speakerSelectedId: number = 0;

    $: if ($selectedTranscriptStore) {
        speakersDropdownItems = $selectedTranscriptStore.speakers.map(
            (speaker: string, index: number) => {
                return {
                    id: index,
                    text: speaker,
                };
            },
        );

        speakerSelectedId =
            speakersDropdownItems.find((speakerDropdownItem: DropdownItem) => {
                return (
                    speakerDropdownItem.text ===
                    $selectedTranscriptStore.participant
                );
            })?.id || 0;
    }
</script>

<div class="participant-identification-container">
    <div class="participant-identification-title-container">
        <h3 class="transcript-section-title">Participant identification</h3>
        <AILabel
            headerText="Participant identification"
            bodyText="AI is used to identify which speaker is the interviewee based on conversation patterns and content."
            modelName="granite.13b.v2.instruct"
            modelLink=""
        />
    </div>
    {#if !$selectedTranscriptStore || $selectedTranscriptStore.status === RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS}
        <DropdownSkeleton />
    {:else if $selectedTranscriptStore.validation}
        <Dropdown
            size="xl"
            selectedId={speakerSelectedId}
            items={speakersDropdownItems}
            invalid={$selectedTranscriptStore.validation.status !==
                ValidationStatus.Ok}
        />
    {/if}
</div>

<style lang="scss">
    .participant-identification-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .participant-identification-title-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>
