import {
    SerializableStudyStatusIcon,
    SerializableTranscriptStatusIcon,
    StudyState,
    TranscriptState,
    type StudyStatusI,
    type TranscriptStatusI,
} from "$lib/models";
import {
    CheckmarkOutline,
    CircleFill,
    InProgress,
    WarningAltFilled,
    WarningFilled,
    type CarbonIconProps,
} from "carbon-icons-svelte";
import type { Component } from "svelte";

export const APP_TITLE: string = "QUX 360 Analyzer";

const ICON_DEFAULT_COLOR: string = "#525252";
const ICON_ERROR_COLOR: string = "#da1e28";
const ICON_SUCCESS_COLOR: string = "#198038";

export const SERIALIZABLE_TRANSCRIPT_STATUS_TO_ICON_MAP: Record<
    SerializableTranscriptStatusIcon,
    Component<CarbonIconProps>
> = {
    [SerializableTranscriptStatusIcon.CheckmarkOutline]: CheckmarkOutline,
    [SerializableTranscriptStatusIcon.CircleFill]: CircleFill,
    [SerializableTranscriptStatusIcon.InProgress]: InProgress,
    [SerializableTranscriptStatusIcon.WarningFilled]: WarningFilled,
};

export const SERIALIZABLE_STUDY_STATUS_TO_ICON_MAP: Record<
    SerializableStudyStatusIcon,
    Component<CarbonIconProps>
> = {
    [SerializableStudyStatusIcon.CheckmarkOutline]: CheckmarkOutline,
    [SerializableStudyStatusIcon.WarningAltFilled]: WarningAltFilled,
    [SerializableStudyStatusIcon.WarningFilled]: WarningFilled,
};

export const RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS: TranscriptStatusI =
    {
        icon: InProgress,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Running,
        status: "Running participant identification",
        description:
            "System is in the process of determining which speaker is the participant",
    };

export const PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: WarningFilled,
    iconColor: ICON_ERROR_COLOR,
    state: TranscriptState.Review,
    status: "Participant needs review",
    description:
        "System has identified participant; validation status is uncertain or low quality",
};

export const READY_FOR_ANONYMIZATION_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Ready,
    status: "Ready for anonymization",
    description:
        "System has identified participant; validation status is high quality OR user has approved participant identification",
};

export const RUNNING_ANONYMIZATION_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: InProgress,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Running,
    status: "Running anonymization",
    description: "System is in the process of anonymizing speakers or entities",
};

export const READY_FOR_ANALYSIS_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Ready,
    status: "Ready for analysis",
    description:
        "Participant identification and anonymization are both complete",
};

export const RUNNING_TOPIC_EXTRACTION_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: InProgress,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Running,
    status: "Running topic extraction",
    description: "System is in the process of extracting topics",
};

export const TOPICS_NEED_REVIEW_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: WarningFilled,
    iconColor: ICON_ERROR_COLOR,
    state: TranscriptState.Review,
    status: "Topics need review",
    description:
        "System has identified topics; at least one topic is uncertain or low quality",
};

export const N_TOPICS_IDENTIFIED_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Ready,
    status: "n topics identified",
    description:
        "System and/or user has created n topics; all AI topics are high quality OR user has approved all AI topics OR there are no AI topics",
};

export const READY_TRANSCRIPT_STATUS: TranscriptStatusI = {
    icon: CircleFill,
    iconColor: ICON_SUCCESS_COLOR,
    state: TranscriptState.Ready,
    status: "",
    description:
        "Displayed next to transcript names whenever there is new content ready that the user has not seen yet and all validation is high quality (e.g. participant identification, anonymization, topics)",
};

export const TRANSCRIPT_STATUSES: TranscriptStatusI[] = [
    RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS,
    PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS,
    READY_FOR_ANONYMIZATION_TRANSCRIPT_STATUS,
    RUNNING_ANONYMIZATION_TRANSCRIPT_STATUS,
    READY_FOR_ANALYSIS_TRANSCRIPT_STATUS,
    RUNNING_TOPIC_EXTRACTION_TRANSCRIPT_STATUS,
    TOPICS_NEED_REVIEW_TRANSCRIPT_STATUS,
    N_TOPICS_IDENTIFIED_TRANSCRIPT_STATUS,
    READY_TRANSCRIPT_STATUS,
];

export const NEEDS_REVIEW_STUDY_STATUS: StudyStatusI = {
    icon: WarningFilled,
    iconColor: ICON_ERROR_COLOR,
    state: StudyState.Review,
    status: "Needs review",
    description: `One or more transcripts have a '${PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS.status}' or '${TOPICS_NEED_REVIEW_TRANSCRIPT_STATUS.status}' status`,
};

export const READY_STUDY_STATUS: StudyStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: StudyState.Ready,
    status: "Ready",
    description: "All transcripts ready.",
};

export const ERROR_STUDY_STATUS: StudyStatusI = {
    icon: WarningAltFilled,
    iconColor: ICON_ERROR_COLOR,
    state: StudyState.Error,
    status: "Error uploading transcript",
    description: "There was an error when uploading the transcript",
};

export const STUDY_STATUSES: StudyStatusI[] = [
    NEEDS_REVIEW_STUDY_STATUS,
    READY_STUDY_STATUS,
    ERROR_STUDY_STATUS,
];

export enum TranscriptContentTabID {
    TranscriptInformation = "transcriptInformation",
    Analysis = "analysis",
}

export enum StudyContentTabID {
    Transcripts = "transcripts",
    AllTopics = "all-topics",
    Themes = "themes",
}
