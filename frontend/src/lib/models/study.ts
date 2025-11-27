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

export interface TranscriptStatusI {
    icon: Component<CarbonIconProps>;
    iconColor: string;
    status: string;
    description: string;
}
