import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";
import type {
    IdentifiedTopicI,
    SerializableTranscriptFileI,
    TranscriptFileI,
    ValidationI,
} from ".";

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
    Running = "Running theme suggestion",
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

export enum ValidationStrategy {
    Strictest = "Strictest",
    Consensus = "Consensus",
    Majority = "Majority",
}

export interface IdentifiedThemeI {
    title: string;
    description: string;
    explanation: string;
    topics: IdentifiedTopicI[];
    validation: ValidationI | null;
}

export interface StudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: TranscriptFileI[];
    status: StudyStatus;
    themes: IdentifiedThemeI[];
    validation_strategy: ValidationStrategy;
}

export interface SerializableStudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: SerializableTranscriptFileI[];
    status: StudyStatus;
    themes: IdentifiedThemeI[];
    validation_strategy: ValidationStrategy;
}

export interface ThemeCardI {
    id: string;
    theme: IdentifiedThemeI;
    isOpen: boolean;
}

// ─────────────────────────────────────────────
// Responses Interfaces
// ─────────────────────────────────────────────

export interface StudyThemesResult {
    result: IdentifiedThemeI[];
    validation: ValidationI;
    item_validations: ValidationI[];
}

export interface StudyThemesResponse {
    message?: string;
    error?: string;
    study_topics_result: StudyThemesResult | null;
}
