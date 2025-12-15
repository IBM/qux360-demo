import { TranscriptStatus, type TranscriptFileI } from "$lib/models";
import { derived, writable, type Readable, type Writable } from "svelte/store";
import { selectedStudyStore } from "./selected-study-store";

export const selectedTranscriptFileIdStore: Writable<number | undefined> =
    writable<number | undefined>(undefined);

export const selectedTranscriptStore: Readable<TranscriptFileI | null> =
    derived(
        [selectedStudyStore, selectedTranscriptFileIdStore],
        ([$selectedStudyStore, $selectedTranscriptId]) => {
            if (!$selectedStudyStore) {
                return null;
            }

            const transcriptSelected: TranscriptFileI | null =
                $selectedStudyStore.transcriptFiles.find(
                    (transcript: TranscriptFileI) =>
                        transcript.id === $selectedTranscriptId,
                ) || null;
            return transcriptSelected;
        },
    );

export const isParticipantIdentificationRunningStore: Readable<boolean> =
    derived(
        selectedTranscriptStore,
        ($selectedTranscriptStore) =>
            $selectedTranscriptStore !== null &&
            $selectedTranscriptStore.status ===
                TranscriptStatus.RunningParticipantIdentification,
    );

export const isParticipantNeedsReviewStore: Readable<boolean> = derived(
    selectedTranscriptStore,
    ($selectedTranscriptStore) =>
        $selectedTranscriptStore !== null &&
        $selectedTranscriptStore.status ===
            TranscriptStatus.ParticipantNeedsReview,
);

export const isRunningAnonymizationStore: Writable<boolean> =
    writable<boolean>(false);

export const isRunningTopicsSuggestionStore: Writable<boolean> =
    writable<boolean>(false);
