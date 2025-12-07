<script lang="ts">
    import {
        AILabel,
        RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS,
    } from "$lib/common";
    import { ValidationStatus, type DropdownItem } from "$lib/models";
    import { selectedTranscriptStore } from "$lib/stores";
    import {
        Dropdown,
        DropdownSkeleton,
        Search,
    } from "carbon-components-svelte";

    let searchQuoteOrTopicValue: string = "";

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

<div class="transcript-information-tab-content-container">
    <div class="left-content-container">
        <div class="participant-identification-container">
            <div class="participant-identification-title-container">
                <h3 class="section-title">Participant identification</h3>
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

        <h3 class="section-title">Speaker anonymization</h3>

        <h3 class="section-title">Entity anonymization</h3>
    </div>
    <div class="right-content-container">
        <div class="right-content-internal-container">
            <h3 class="section-title">Transcript</h3>
            <Search
                bind:value={searchQuoteOrTopicValue}
                placeholder="Search for a quote or topic"
            />
        </div>
    </div>
</div>

<style lang="scss">
    @use "@carbon/type";

    .transcript-information-tab-content-container {
        flex: 1;
        display: flex;
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
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 1rem;
        padding-right: 2rem;
    }

    .right-content-internal-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem 2rem;
        border: 0.5px solid var(--cds-border-subtle-selected);
        border-radius: 0.5rem;
    }

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

    .section-title {
        @include type.type-style("heading-03");
        line-height: 1.75rem;
    }
</style>
