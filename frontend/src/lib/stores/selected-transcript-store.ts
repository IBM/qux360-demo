import type { TranscriptFileI } from "$lib/models";
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
