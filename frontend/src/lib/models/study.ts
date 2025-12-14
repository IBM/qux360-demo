import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";
import type { SerializableTranscriptFileI, TranscriptFileI } from ".";

// ─────────────────────────────────────────────
// Study Status Interfaces
// ─────────────────────────────────────────────

export enum StudyState {
    Ready = "ready",
    Review = "review",
    Error = "error",
}

export enum StudyStatus {
    NeedsReview = "Needs review",
    Ready = "Ready",
    Error = "Error uploading transcript",
}

export interface ExtendedStudyStatus {
    description: string;
    icon: Component<CarbonIconProps>;
    iconColor: string;
    state: StudyState;
}

// ─────────────────────────────────────────────
// Study Interfaces
// ─────────────────────────────────────────────

export interface StudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: TranscriptFileI[];
    status: StudyStatus;
}

export interface SerializableStudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: SerializableTranscriptFileI[];
    status: StudyStatus;
}
