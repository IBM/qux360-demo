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
