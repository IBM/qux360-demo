import type { Component } from "svelte";

export interface NotificationI {
    id: string;
    kind:
        | "error"
        | "info"
        | "info-square"
        | "success"
        | "warning"
        | "warning-alt";
    title: string;
    subtitle: string;
}

export type NewNotification = Omit<NotificationI, "id">;

export interface ProgressStepI {
    id: number;
    label: string;
    isComplete: boolean;
    component: Component<{
        currentStepIndex: number;
        steps: ProgressStepI[];
        studyName: string;
        studyDescription: string;
    }>;
}
