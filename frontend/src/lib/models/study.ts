import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";

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
}

export interface TranscriptStatusI {
    icon: Component<CarbonIconProps>;
    iconColor: string;
    state: TranscriptState;
    status: string;
    description: string;
}

export interface TranscriptFileI {
    id?: number;
    name: string;
    file: File;
    size: number;
    type: string;
    status: TranscriptStatusI;
    speakers: string[];
    participant: string;
    validation: IntervieweeValidation | null;
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
    participant: string;
    validation: IntervieweeValidation | null;
}

export enum StudyState {
    Ready = "ready",
    Review = "review",
    Error = "error",
}

export interface StudyStatusI {
    icon: Component<CarbonIconProps>;
    iconColor: string;
    state: StudyState;
    status: string;
    description: string;
}

export interface StudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: TranscriptFileI[];
    status: StudyStatusI;
}

export enum SerializableStudyStatusIcon {
    CheckmarkOutline = "CheckmarkOutline",
    WarningAltFilled = "WarningAltFilled",
    WarningFilled = "WarningFilled",
}

export interface SerializableStudyStatusI {
    icon: SerializableStudyStatusIcon;
    iconColor: string;
    state: StudyState;
    status: string;
    description: string;
}

export interface SerializableStudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: SerializableTranscriptFileI[];
    status: SerializableStudyStatusI;
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
