<script lang="ts">
    import {
        AILabel,
        PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS,
        RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS,
    } from "$lib/common";
    import { type DropdownItem } from "$lib/models";
    import {
        selectedStudyIdStore,
        selectedTranscriptFileIdStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import { Dropdown, DropdownSkeleton, Link } from "carbon-components-svelte";

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
                    $selectedTranscriptStore.participant.name
                );
            })?.id || 0;
    }

    const updateParticipantExplanation = (): void => {
        console.log("updateParticipantExplanation");
        if ($selectedStudyIdStore && $selectedTranscriptFileIdStore) {
            studiesStore.updateParticipantExplanation(
                $selectedStudyIdStore,
                $selectedTranscriptFileIdStore,
            );
        }
    };
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
    {#if !$selectedTranscriptStore || $selectedTranscriptStore.status.status === RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS.status}
        <DropdownSkeleton />
    {:else if $selectedTranscriptStore.validation}
        <div class="participant-dropdown-container">
            <Dropdown
                size="xl"
                selectedId={speakerSelectedId}
                items={speakersDropdownItems}
                invalid={$selectedTranscriptStore.status.status ===
                    PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS.status}
                on:select={updateParticipantExplanation}
            />
            {#if $selectedTranscriptStore.participant.showExplanation}
                <div class="participant-explanation-container">
                    {#if $selectedTranscriptStore.status.status === PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS.status}
                        <strong>Needs review:</strong>
                    {/if}
                    <span>
                        {$selectedTranscriptStore.participant.explanation}
                    </span>
                    <Link
                        class="dismiss-explanation-link"
                        on:click={updateParticipantExplanation}
                    >
                        Dismiss
                    </Link>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    @use "@carbon/type";

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

    .participant-dropdown-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .participant-explanation-container {
        @include type.type-style("label-01");
        line-height: 1rem;
    }

    :global(.dismiss-explanation-link) {
        cursor: pointer;
    }
</style>
