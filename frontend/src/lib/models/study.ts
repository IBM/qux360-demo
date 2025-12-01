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
    name: string;
    file: File;
    size: number;
    type: string;
    status: TranscriptStatusI;
}

export interface StudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: TranscriptFileI[];
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
    name: string;
    file: string;
    size: number;
    type: string;
    status: SerializableTranscriptStatusI;
}

export interface SerializableStudyI {
    id: string;
    name: string;
    description: string;
    transcriptFiles: SerializableTranscriptFileI[];
}
