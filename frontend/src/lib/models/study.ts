import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";
import type { SerializableTranscriptFileI, TranscriptFileI } from ".";

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
