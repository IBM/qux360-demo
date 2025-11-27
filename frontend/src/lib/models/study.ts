import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";

export enum StudyFileStatus {
    Success = "success",
    Error = "error",
}

export interface StudyFileI {
    id: string;
    file: File;
    status: StudyFileStatus;
    message?: string;
}

export interface TranscriptStatusI {
    icon: Component<CarbonIconProps>;
    iconColor: string;
    status: string;
    description: string;
}
