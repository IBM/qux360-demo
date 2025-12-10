import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";

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

export interface UploadTranscriptFileResultI {
    successes: UploadTranscriptFileSuccessI[];
    errors: UploadTranscriptFileErrorI[];
}

export enum TranscriptState {
    Running = "running",
    Ready = "ready",
    Review = "review",
    Finish = "finish",
}

export interface TranscriptStatusI {
    icon: Component<CarbonIconProps>;
    iconColor: string;
    state: TranscriptState;
    status: string;
    description: string;
}

export interface IdentifiedParticipantI {
    name: string;
    explanation: string;
    showExplanation: boolean;
}

export interface TranscriptFileI {
    id?: number;
    name: string;
    file: File;
    size: number;
    type: string;
    status: TranscriptStatusI;
    speakers: string[];
    participant: IdentifiedParticipantI;
    validation: IntervieweeValidation | null;
    speaker_anonymization_map: SpeakerAnonymizationMap | null;
    entity_anonymization_map: EntityAnonymizationMap;
}

export enum SerializableTranscriptStatusIcon {
    CheckmarkOutline = "CheckmarkOutline",
    CircleFill = "CircleFill",
    InProgress = "InProgress",
    WarningFilled = "WarningFilled",
}

export interface SerializableTranscriptStatusI {
    icon: SerializableTranscriptStatusIcon;
    iconColor: string;
    state: TranscriptState;
    status: string;
    description: string;
}

export interface SerializableTranscriptFileI {
    id?: number;
    name: string;
    file: string;
    size: number;
    type: string;
    status: SerializableTranscriptStatusI;
    speakers: string[];
    participant: IdentifiedParticipantI;
    validation: IntervieweeValidation | null;
    speaker_anonymization_map: SpeakerAnonymizationMap | null;
    entity_anonymization_map: EntityAnonymizationMap;
}

export enum ValidationStatus {
    Ok = "ok",
    Check = "check",
    Iffy = "iffy",
}

export interface IntervieweeValidation {
    status: ValidationStatus;
    explanation: string;
    errors: any[];
    method: string | null;
    metadata: IntervieweeMetadata | null;
    checks: IntervieweeValidation[];
    informational: boolean;
}

export interface IntervieweeMetadata {
    word_ratio?: number;
    prediction: string;
    agreement?: boolean;
}

export interface IdentifyParticipantResponse {
    message?: string;
    error?: string;
    speakers: string[];
    participant: string;
    validation: IntervieweeValidation | null;
}

export interface SpeakerAnonymizationResponse {
    message?: string;
    error?: string;
    anonymization_map: SpeakerAnonymizationMap | null;
}

export interface TranscriptLineI {
    line_number: number;
    timestamp: string;
    speaker: string;
    statement: string;
}
