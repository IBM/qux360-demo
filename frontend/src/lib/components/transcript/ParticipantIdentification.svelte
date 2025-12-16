<script lang="ts">
    import { AILabel } from "$lib/common";
    import { type DropdownItem } from "$lib/models";
    import {
        isParticipantIdentificationRunningStore,
        isParticipantNeedsReviewStore,
        selectedStudyIdStore,
        selectedStudyStore,
        selectedTranscriptFileIdStore,
        selectedTranscriptStore,
        studiesStore,
    } from "$lib/stores";
    import {
        Button,
        Dropdown,
        DropdownSkeleton,
        Link,
    } from "carbon-components-svelte";

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

    const handleRunParticipantIdentificationButtonClick = (): void => {
        if ($selectedStudyStore && $selectedTranscriptFileIdStore) {
            studiesStore.runParticipantIdentification(
                $selectedStudyStore,
                $selectedTranscriptFileIdStore,
            );
        }
    };

    const updateParticipantExplanation = (): void => {
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
    {#if !$selectedTranscriptStore || $isParticipantIdentificationRunningStore}
        <DropdownSkeleton />
    {:else if $selectedTranscriptStore.participant.name.length === 0}
        <Button
            kind="primary"
            size="field"
            on:click={handleRunParticipantIdentificationButtonClick}
        >
            Run participant identification
        </Button>
    {:else if $selectedTranscriptStore.participant.validation}
        <div class="participant-dropdown-container">
            <Dropdown
                size="xl"
                selectedId={speakerSelectedId}
                items={speakersDropdownItems}
                invalid={$isParticipantNeedsReviewStore}
                on:select={updateParticipantExplanation}
            />
            {#if $selectedTranscriptStore.participant.showExplanation}
                <div class="participant-explanation-container">
                    {#if $isParticipantNeedsReviewStore}
                        <strong>Needs review:</strong>
                    {/if}
                    <span>
                        {$selectedTranscriptStore.participant.explanation}
                    </span>
                    <Link class="link" on:click={updateParticipantExplanation}>
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
</style>
