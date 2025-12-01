import {
    SerializableTranscriptStatusIcon,
    TranscriptState,
    type TranscriptStatusI,
} from "$lib/models";
import {
    CheckmarkOutline,
    CircleFill,
    InProgress,
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

export const RUNNING_PARTICIPANT_IDENTIFICATION_STATUS: TranscriptStatusI = {
    icon: InProgress,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Running,
    status: "Running participant identification",
    description:
        "System is in the process of determining which speaker is the participant",
};

export const PARTICIPANT_NEEDS_REVIEW_STATUS: TranscriptStatusI = {
    icon: WarningFilled,
    iconColor: ICON_ERROR_COLOR,
    state: TranscriptState.Review,
    status: "Participant needs review",
    description:
        "System has identified participant; validation status is uncertain or low quality",
};

export const READY_FOR_ANONYMIZATION_STATUS: TranscriptStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Ready,
    status: "Ready for anonymization",
    description:
        "System has identified participant; validation status is high quality OR user has approved participant identification",
};

export const RUNNING_ANONYMIZATION_STATUS: TranscriptStatusI = {
    icon: InProgress,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Running,
    status: "Running anonymization",
    description: "System is in the process of anonymizing speakers or entities",
};

export const READY_FOR_ANALYSIS_STATUS: TranscriptStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Ready,
    status: "Ready for analysis",
    description:
        "Participant identification and anonymization are both complete",
};

export const RUNNING_TOPIC_EXTRACTION_STATUS: TranscriptStatusI = {
    icon: InProgress,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Running,
    status: "Running topic extraction",
    description: "System is in the process of extracting topics",
};

export const TOPICS_NEED_REVIEW_STATUS: TranscriptStatusI = {
    icon: WarningFilled,
    iconColor: ICON_ERROR_COLOR,
    state: TranscriptState.Review,
    status: "Topics need review",
    description:
        "System has identified topics; at least one topic is uncertain or low quality",
};

export const N_TOPICS_IDENTIFIED_STATUS: TranscriptStatusI = {
    icon: CheckmarkOutline,
    iconColor: ICON_DEFAULT_COLOR,
    state: TranscriptState.Ready,
    status: "n topics identified",
    description:
        "System and/or user has created n topics; all AI topics are high quality OR user has approved all AI topics OR there are no AI topics",
};

export const READY_STATUS: TranscriptStatusI = {
    icon: CircleFill,
    iconColor: ICON_SUCCESS_COLOR,
    state: TranscriptState.Ready,
    status: "",
    description:
        "Displayed next to transcript names whenever there is new content ready that the user has not seen yet and all validation is high quality (e.g. participant identification, anonymization, topics)",
};

export const TRANSCRIPT_STATUSES: TranscriptStatusI[] = [
    RUNNING_PARTICIPANT_IDENTIFICATION_STATUS,
    PARTICIPANT_NEEDS_REVIEW_STATUS,
    READY_FOR_ANONYMIZATION_STATUS,
    RUNNING_ANONYMIZATION_STATUS,
    READY_FOR_ANALYSIS_STATUS,
    RUNNING_TOPIC_EXTRACTION_STATUS,
    TOPICS_NEED_REVIEW_STATUS,
    N_TOPICS_IDENTIFIED_STATUS,
    READY_STATUS,
];
