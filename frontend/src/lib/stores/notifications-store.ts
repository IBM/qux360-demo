import type { NewNotification, NotificationI } from "$lib/models";
import { utilsService } from "$lib/services";
import { writable, type Writable } from "svelte/store";

const notifications: Writable<NotificationI[]> = writable([]);

export const notificationsStore = {
    subscribe: notifications.subscribe,
    addNotification: (notification: NewNotification) => {
        const newNotification: NotificationI = {
            id: utilsService.getUniqueId(),
            kind: notification.kind,
            title: notification.title,
            subtitle: notification.subtitle,
        };
        notifications.update((notifications: NotificationI[]) => {
            return [newNotification, ...notifications];
        });
        setTimeout(() => {
            notificationsStore.dismissNotification(newNotification.id);
        }, 10000);
    },
    dismissNotification: (notificationId: string) => {
        notifications.update((notifications: NotificationI[]) => {
            return notifications.filter((n) => n.id !== notificationId);
        });
    },
};
