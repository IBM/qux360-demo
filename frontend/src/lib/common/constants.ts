import {
    StudyState,
    StudyStatus,
    TranscriptState,
    TranscriptStatus,
    ValidationStatus,
    ValidationStrategy,
    type ExtendedStudyStatus,
    type ExtendedTranscriptStatus,
    type ExtendedValidationStatus,
} from "$lib/models";
import {
    CheckmarkFilled,
    CheckmarkOutline,
    ErrorFilled,
    ErrorOutline,
    Help,
    HelpFilled,
    InProgress,
    WarningAltFilled,
    WarningFilled,
} from "carbon-icons-svelte";

export const APP_TITLE: string = "QUX 360 Analyzer";

const ICON_DEFAULT_COLOR: string = "#525252";
const ICON_ERROR_COLOR: string = "#da1e28";

export const TRANSCRIPT_STATUS_MAP: Record<
    TranscriptStatus,
    ExtendedTranscriptStatus
> = {
    [TranscriptStatus.ReadyToIdentifyParticipants]: {
        description: "",
        icon: CheckmarkOutline,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Ready,
    },
    [TranscriptStatus.RunningParticipantIdentification]: {
        description:
            "System is in the process of determining which speaker is the participant",
        icon: InProgress,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Running,
    },
    [TranscriptStatus.ParticipantNeedsReview]: {
        description:
            "System has identified participant; validation status is uncertain or low quality",
        icon: WarningFilled,
        iconColor: ICON_ERROR_COLOR,
        state: TranscriptState.Review,
    },
    [TranscriptStatus.ReadyForAnonymization]: {
        description:
            "System has identified participant; validation status is high quality OR user has approved participant identification",
        icon: CheckmarkOutline,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Ready,
    },
    [TranscriptStatus.RunningAnonymization]: {
        description:
            "System is in the process of anonymizing speakers or entities",
        icon: InProgress,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Running,
    },
    [TranscriptStatus.ReadyForAnalysis]: {
        description:
            "Participant identification and anonymization are both complete",
        icon: CheckmarkOutline,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Ready,
    },
    [TranscriptStatus.RunningTopicExtraction]: {
        description: "System is in the process of extracting topics",
        icon: InProgress,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Running,
    },
    [TranscriptStatus.TopicsNeedReview]: {
        description:
            "System has identified topics; at least one topic is uncertain or low quality",
        icon: WarningFilled,
        iconColor: ICON_ERROR_COLOR,
        state: TranscriptState.Review,
    },
    [TranscriptStatus.Ready]: {
        description:
            "Displayed next to transcript names whenever there is new content ready that the user has not seen yet and all validation is high quality (e.g. participant identification, anonymization, topics)",
        icon: CheckmarkOutline,
        iconColor: ICON_DEFAULT_COLOR,
        state: TranscriptState.Finish,
    },
};

export const STUDY_STATUS_MAP: Record<StudyStatus, ExtendedStudyStatus> = {
    [StudyStatus.NeedsReview]: {
        description: "",
        icon: WarningFilled,
        iconColor: ICON_ERROR_COLOR,
        state: StudyState.Review,
    },
    [StudyStatus.Ready]: {
        description: "All transcripts ready.",
        icon: CheckmarkOutline,
        iconColor: ICON_DEFAULT_COLOR,
        state: StudyState.Ready,
    },
    [StudyStatus.Error]: {
        description: "There was an error when uploading the transcript",
        icon: WarningAltFilled,
        iconColor: ICON_ERROR_COLOR,
        state: StudyState.Error,
    },
};

export const VALIDATION_STATUS_MAP: Record<
    ValidationStatus,
    ExtendedValidationStatus
> = {
    [ValidationStatus.Ok]: {
        text: "High quality",
        principalIcon: CheckmarkFilled,
        secondaryIcon: CheckmarkOutline,
        iconColor: "#0043CE",
    },
    [ValidationStatus.Check]: {
        text: "Uncertain quality",
        principalIcon: HelpFilled,
        secondaryIcon: Help,
        iconColor: "#FF832B",
    },
    [ValidationStatus.Iffy]: {
        text: "Low quality",
        principalIcon: ErrorFilled,
        secondaryIcon: ErrorOutline,
        iconColor: "#DA1E28",
    },
};

export const VALIDATION_STRATEGY_MAP: Record<ValidationStrategy, string> = {
    [ValidationStrategy.Strictest]: "Show worst status",
    [ValidationStrategy.Consensus]:
        "All validations must agree on high quality, otherwise show uncertain quality",
    [ValidationStrategy.Majority]: "Show most frequently occurring status",
};

export enum TranscriptContentTabID {
    TranscriptInformation = "transcriptInformation",
    Analysis = "analysis",
}

export enum StudyContentTabID {
    Transcripts = "transcripts",
    AllTopics = "all-topics",
    Themes = "themes",
}
