import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";

// ─────────────────────────────────────────────
// Uploaded Transcript Interfaces
// ─────────────────────────────────────────────

export enum UploadedTranscriptFileStatus {
    Success = "success",
    Error = "error",
}

export interface UploadedTranscriptFileI {
    id: string;
    file: File;
    status: UploadedTranscriptFileStatus;
    message?: string;
}

export interface UploadTranscriptFileSuccessI {
    fileId: number;
    filename: string;
}

export interface UploadTranscriptFileErrorI {
    error: string;
    filename: string;
}

export interface UploadTranscriptFilesResultI {
    study_id: string;
    successes: UploadTranscriptFileSuccessI[];
    errors: UploadTranscriptFileErrorI[];
}

// ─────────────────────────────────────────────
// Transcript Status Interfaces
// ─────────────────────────────────────────────

export enum TranscriptState {
    Running = "running",
    Ready = "ready",
    Review = "review",
}

export enum TranscriptStatus {
    ReadyToIdentifyParticipants = "Ready to identify participants",
    RunningParticipantIdentification = "Running participant identification",
    ParticipantNeedsReview = "Participant needs review",
    ReadyForAnonymization = "Ready for anonymization",
    RunningAnonymization = "Running anonymization",
    ReadyForAnalysis = "Ready for analysis",
    RunningTopicSuggestion = "Running topic suggestion",
    TopicsNeedReview = "Topics need review",
    Ready = "Ready",
}

export interface ExtendedTranscriptStatus {
    description: string;
    icon: Component<CarbonIconProps>;
    iconColor: string;
    state: TranscriptState;
}

// ─────────────────────────────────────────────
// Validation Status Interfaces
// ─────────────────────────────────────────────

export enum ValidationStatus {
    Ok = "ok",
    Check = "check",
    Iffy = "iffy",
}

export interface ExtendedValidationStatus {
    text: string;
    principalIcon: Component<CarbonIconProps>;
    secondaryIcon: Component<CarbonIconProps>;
    iconColor: string;
}

export interface ValidationMetadata {
    word_ratio?: number;
    prediction?: string;
    agreement?: boolean;
    strengths?: string;
    weaknesses?: string;
    full_assessment?: string;
}

export interface ValidationI {
    status: ValidationStatus;
    explanation: string;
    errors: any[];
    method: string | null;
    metadata: ValidationMetadata | null;
    checks: ValidationI[];
    informational: boolean;
    isApprovedByUser: boolean;
}

// ─────────────────────────────────────────────
// Anonymization Interfaces
// ─────────────────────────────────────────────

export type SpeakerAnonymizationMap = { [name: string]: string };

export type EntityAnonymizationMap = { [name: string]: string };

export interface ExtendedEntityAnonymization {
    alias: string;
    count: number;
    transcriptLines: TranscriptLineI[];
}

export type ExtendedEntityAnonymizationMap = {
    [name: string]: ExtendedEntityAnonymization;
};

// ─────────────────────────────────────────────
// Transcript Interfaces
// ─────────────────────────────────────────────

export interface IdentifiedParticipantI {
    name: string;
    explanation: string;
    showExplanation: boolean;
    validation: ValidationI | null;
}

export interface IdentifiedTopicI {
    topic: string;
    explanation: string;
    quotes: QuoteI[];
    validation: ValidationI | null;
    interview_id?: string;
}

export interface TranscriptFileI {
    id?: number;
    name: string;
    file: File;
    size: number;
    type: string;
    status: TranscriptStatus;
    speakers: string[];
    participant: IdentifiedParticipantI;
    speaker_anonymization_map: SpeakerAnonymizationMap | null;
    entity_anonymization_map: EntityAnonymizationMap;
    topics: IdentifiedTopicI[];
}

export interface SerializableTranscriptFileI {
    id?: number;
    name: string;
    file: string;
    size: number;
    type: string;
    status: TranscriptStatus;
    speakers: string[];
    participant: IdentifiedParticipantI;
    speaker_anonymization_map: SpeakerAnonymizationMap | null;
    entity_anonymization_map: EntityAnonymizationMap;
    topics: IdentifiedTopicI[];
}

export interface TranscriptLineI {
    index: number;
    timestamp: string;
    speaker: string;
    statement: string;
}

export interface QuoteI {
    index: number;
    timestamp: string;
    speaker: string;
    quote: string;
}

export interface IdentifiedTopicWithTranscriptI {
    topic: IdentifiedTopicI;
    transcriptFile: TranscriptFileI;
}

export interface TopicCardI {
    id: string;
    topic: IdentifiedTopicI;
    transcriptFile: TranscriptFileI;
    isOpen: boolean;
}

// ─────────────────────────────────────────────
// Responses Interfaces
// ─────────────────────────────────────────────

export interface IdentifyParticipantResponse {
    message?: string;
    error?: string;
    speakers: string[];
    participant: string;
    validation: ValidationI | null;
}

export interface SpeakerAnonymizationResponse {
    message?: string;
    error?: string;
    speakers_anonymization_map: SpeakerAnonymizationMap | null;
}

export interface EntityAnonymizationResponse {
    message?: string;
    error?: string;
    entities_anonymization_map: EntityAnonymizationMap | null;
}

export interface InterviewTopicsResult {
    result: IdentifiedTopicI[];
    validation: ValidationI;
    item_validations: ValidationI[];
}

export interface TranscriptTopicsResponse {
    message?: string;
    error?: string;
    interview_topics_result: InterviewTopicsResult | null;
}
